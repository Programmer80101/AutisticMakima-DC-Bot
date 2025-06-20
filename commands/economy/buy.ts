import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  ComponentType,
  ButtonInteraction,
  AutocompleteInteraction,
  GuildTextBasedChannel,
} from "discord.js";

import { validatePurchase, buyItem } from "../../firebase/shop";
import { modifyInventoryItem } from "../../firebase/inventory";
import { autoCompleteShopItems } from "../../utility/autocomplete";
import { createCommandGuideEmbed } from "../../utility/embed";
import commands from "../../config/commands";
import colors from "../../config/colors";
import emojis from "../../config/emojis";
import bot from "../../config/bot";

const purchaseTimeout = 30;

const prefix = bot.prefix;
const command = commands.economy.commands.buy;
const pendingPurchases = new Set<string>();

const getPurchaseConfirmationButtons = (disabled: boolean = false) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("buy_confirm")
      .setLabel(`${emojis.status.success} Confirm`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("buy_cancel")
      .setLabel(`${emojis.status.error} Cancel`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
};

const getPurchaseConfirmationEmbed = (
  item: { name: string; emoji: string; price: number },
  quantity: number,
  totalPrice: number
) => {
  const confirmationEmbed = new EmbedBuilder()
    .setColor(colors.embed.status.pending)
    .setTitle(`${command.emoji} Purchase Confirmation`)
    .setDescription(
      `Are you sure you want to buy **${quantity}x ${item.name}** for ${emojis.currency.coin} **${totalPrice}**?`
    )
    .addFields({
      name: "Item",
      value: `${item.emoji} ${item.name}`,
      inline: true,
    })
    .addFields({
      name: "Quantity",
      value: quantity.toString(),
      inline: true,
    })
    .addFields({
      name: "Total Price",
      value: `${emojis.currency.coin} ${totalPrice}`,
      inline: true,
    })
    .setFooter({
      text: `Your purchase will automatically cancel in ${purchaseTimeout}s`,
    });

  return confirmationEmbed;
};

const getErrorEmbed = (title: string, description: string) => {
  const errorEmbed = new EmbedBuilder()
    .setColor(colors.embed.status.error)
    .setTitle(title)
    .setDescription(description);

  return errorEmbed;
};

const startPurchase = async (
  source: ChatInputCommandInteraction | Message,
  userId: string,
  itemName: string | null,
  quantity: number
) => {
  if (pendingPurchases.has(userId)) {
    return await source.reply({
      embeds: [
        getErrorEmbed(
          `${emojis.status.error} Pending Purchase`,
          "You already have a pending purchase. Please complete or cancel it before making a new one."
        ),
      ],
    });
  }

  pendingPurchases.add(userId);

  if (!itemName) {
    pendingPurchases.delete(userId);
    return await source.reply({
      embeds: [createCommandGuideEmbed(command.name)],
    });
  }

  const validationResult = await validatePurchase(userId, itemName, quantity);

  if (validationResult.error) {
    pendingPurchases.delete(userId);
    return await source.reply({
      embeds: [
        getErrorEmbed(validationResult.title, validationResult.description),
      ],
    });
  }

  const item = validationResult.item;

  const totalPrice = item.price * quantity;
  const confirmationEmbed = getPurchaseConfirmationEmbed(
    item,
    quantity,
    totalPrice
  );

  const row = getPurchaseConfirmationButtons();

  let confirmationMessage: Message;

  if (source instanceof ChatInputCommandInteraction) {
    await source.reply({
      embeds: [confirmationEmbed],
      components: [row],
      withResponse: true,
    });

    confirmationMessage = await source.fetchReply();
  } else if (source instanceof Message) {
    confirmationMessage = await source.reply({
      embeds: [confirmationEmbed],
      components: [row],
    });
  } else {
    throw new Error("Recieved unexpected input");
  }

  const filter = (interaction: ButtonInteraction) => {
    return (
      interaction.user.id === userId && interaction.customId.startsWith("buy_")
    );
  };

  const collector = confirmationMessage.createMessageComponentCollector({
    filter,
    componentType: ComponentType.Button,
    max: 1,
    time: purchaseTimeout * 1000,
  });

  collector.on("collect", async (interaction: ButtonInteraction) => {
    pendingPurchases.delete(userId);

    const row = getPurchaseConfirmationButtons(true);
    await interaction.update({
      embeds: [confirmationEmbed],
      components: [row],
    });

    if (interaction.customId === "buy_cancel") {
      return await interaction.followUp({
        embeds: [
          getErrorEmbed(
            `${emojis.status.error} Purchase Cancelled`,
            "Your purchase has been cancelled."
          ),
        ],
      });
    }

    const validationResult = await validatePurchase(userId, itemName, quantity);

    if (validationResult.error) {
      return await interaction.followUp({
        embeds: [
          getErrorEmbed(validationResult.title, validationResult.description),
        ],
      });
    }

    await buyItem(userId, item, quantity);
    await modifyInventoryItem(userId, item.id, quantity);

    const successEmbed = new EmbedBuilder()
      .setColor(colors.embed.status.success)
      .setTitle(`${emojis.status.success} Purchase Successful`)
      .setDescription(
        `You have successfully bought **${quantity}x** **${item.name}** for ${emojis.currency.coin} **${totalPrice}**.`
      )
      .setFooter({
        text: `Use \`${prefix}use (item_name)\` to use your item.`,
      });

    await interaction.followUp({
      embeds: [successEmbed],
    });

    return;
  });

  collector.on("end", async (collected) => {
    pendingPurchases.delete(userId);

    if (collected.size === 0) {
      const row = getPurchaseConfirmationButtons(true);
      await confirmationMessage.edit({
        embeds: [confirmationEmbed],
        components: [row],
      });

      const channel = source.channel as GuildTextBasedChannel;
      await channel?.send({
        embeds: [
          getErrorEmbed(
            `${emojis.status.error} Purchase Cancelled`,
            "You took too long to respond. Your purchase has been cancelled."
          ),
        ],
      });
    }
  });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .addStringOption((option) => {
      return option
        .setName(command.args[0].name)
        .setDescription(command.args[0].description)
        .setRequired(command.args[0].required)
        .setAutocomplete(true);
    })
    .addIntegerOption((option) => {
      return option
        .setName(command.args[1].name)
        .setDescription(command.args[1].description)
        .setRequired(command.args[1].required);
    }),

  async autocomplete(interaction: AutocompleteInteraction) {
    await autoCompleteShopItems(interaction);
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const itemName = interaction.options.getString(command.args[0].name);
    const quantity = interaction.options.getInteger(command.args[1].name) || 1;

    await startPurchase(interaction, interaction.user.id, itemName, quantity);
  },

  async prefix(message: Message) {
    const [, ...args] = message.content.trim().split(/\s+/);
    if (!args.length) {
      return await message.reply({
        embeds: [createCommandGuideEmbed(command.name)],
      });
    }

    let quantity = 1;
    let itemName = args.join(" ");
    const last = args[args.length - 1];
    if (/^\d+$/.test(last)) {
      quantity = parseInt(last, 10);
      itemName = args.slice(0, -1).join(" ");
    }

    await startPurchase(message, message.author.id, itemName, quantity);
  },
};
