import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";

import { checkBuyItem, buyItem } from "../../utils/shop.js";
import { modifyInventoryItem } from "../../utils/inventory.js";
import { autoCompleteShopItems } from "../../utils/autocomplete.js";
import { createCommandGuideEmbed } from "../../utils.js";
import commandConfig from "../../commands.js";
import config from "../../config.js";

const command = commandConfig.economy.commands.buy;
const pendingPurchases = new Set();

const getPurchaseConfirmationButtons = (disabled = false) => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("buy_confirm")
      .setLabel("✅ Confirm")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("buy_cancel")
      .setLabel("❌ Cancel")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
};

const getPurchaseConfirmationEmbed = (item, quantity, totalPrice) => {
  return {
    color: config.embed.color.default,
    title: `${command.emoji} Purchase Confirmation`,
    description: `Are you sure you want to buy **${quantity}** of **${item.name}** for ${config.emoji.general.currency} **${totalPrice}**?`,
    fields: [
      {
        name: "Item",
        value: `${item.emoji} ${item.name}`,
        inline: true,
      },
      {
        name: "Quantity",
        value: quantity.toString(),
        inline: true,
      },
      {
        name: "Total Price",
        value: `${config.emoji.general.currency} ${totalPrice}`,
        inline: true,
      },
    ],
  };
};

const getErrorEmbed = (title, message) => {
  return {
    color: config.embed.color.red,
    title: title,
    description: message,
  };
};

const startPurchase = async (source, userId, itemName, quantity) => {
  if (pendingPurchases.has(userId)) {
    return await source.reply({
      embeds: [
        getErrorEmbed(
          "❌ Pending Purchase",
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

  const { error, title, message, item } = await checkBuyItem(
    userId,
    itemName,
    quantity
  );

  if (error) {
    pendingPurchases.delete(userId);
    return await source.reply({
      embeds: [getErrorEmbed(title, message)],
    });
  }

  const totalPrice = item.price * quantity;
  const confirmationEmbed = getPurchaseConfirmationEmbed(
    item,
    quantity,
    totalPrice
  );

  const row = getPurchaseConfirmationButtons();

  let confirmationMessage = null;

  if (source instanceof ChatInputCommandInteraction) {
    await source.reply({
      embeds: [confirmationEmbed],
      components: [row],
      withResponse: true,
    });

    confirmationMessage = await source.fetchReply();
  }

  if (source instanceof Message) {
    confirmationMessage = await source.reply({
      embeds: [confirmationEmbed],
      components: [row],
      withResponse: true,
    });
  }

  const filter = (i) => {
    return i.user.id === userId && i.customId.startsWith("buy_");
  };

  const collector = confirmationMessage.createMessageComponentCollector({
    filter,
    max: 1,
    time: 30_000,
  });

  collector.on("collect", async (interaction) => {
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
            "❌ Purchase Cancelled",
            "Your purchase has been cancelled."
          ),
        ],
      });
    }

    const { error, title, message } = await checkBuyItem(
      userId,
      itemName,
      quantity
    );

    if (error) {
      return await interaction.followUp({
        embeds: [getErrorEmbed(title, message)],
      });
    }

    await buyItem(userId, item, quantity);
    await modifyInventoryItem(userId, item.id, quantity);
    const successEmbed = {
      color: config.embed.color.green,
      title: `✅ Purchase Successful`,
      description: `You have successfully bought **${quantity}** of **${item.name}** for ${config.emoji.general.currency} **${totalPrice}**.`,
      footer: {
        text: `Use \`${config.prefix}use (item_name)\` to use your item.`,
      },
    };

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

      await source.channel.send({
        embeds: [
          getErrorEmbed(
            "❌ Purchase Cancelled",
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

  async autocomplete(interaction) {
    await autoCompleteShopItems(interaction);
  },

  async execute(interaction) {
    const itemName = interaction.options.getString(command.args[0].name);
    const quantity = interaction.options.getInteger(command.args[1].name) || 1;

    await startPurchase(interaction, interaction.user.id, itemName, quantity);
  },

  async prefix(message) {
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
