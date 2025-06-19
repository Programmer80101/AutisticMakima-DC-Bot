import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
  User,
  EmbedBuilder,
  ButtonInteraction,
  ComponentType,
  GuildTextBasedChannel,
} from "discord.js";

import { createCommandGuideEmbed } from "../../utility/embed";
import { getRandomTip } from "../../utility/random";
import {
  validateBalance,
  modifyBalance,
  ValidateBalanceResult,
} from "../../firebase/balance";
import commandConfig from "../../config/commands";
import colors from "../../config/colors";
import emojis from "../../config/emojis";

const transferTimeout = 30;

const command = commandConfig.economy.commands.transfer;
const pendingTransfers = new Set<string>();

const getTransferConfirmationButtons = (disabled: boolean = false) => {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("transfer_confirm")
      .setLabel(`${emojis.status.success} Confirm`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("transfer_cancel")
      .setLabel(`${emojis.status.error} Cancel`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
};

const getTransferConfirmationEmbed = (
  targetUser: User,
  amount: number,
  reason: string
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(colors.embed.status.pending)
    .setTitle(`${command.emoji} Transfer Confirmation`)
    .setDescription(
      `Are you sure you want to transfer ${emojis.currency.coin} **${amount}** to ${targetUser}?`
    )
    .addFields({
      name: "User",
      value: targetUser.toString(),
      inline: true,
    })
    .addFields({
      name: "Amount",
      value: `${emojis.currency.coin} ${amount}`,
      inline: true,
    })
    .addFields({
      name: "Reason",
      value: reason || "*No reason provided*",
      inline: false,
    })
    .setFooter({ text: "We are not responsible for accidental transfer!" });
};

const getErrorEmbed = (title: string, description: string): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(colors.embed.status.error)
    .setTitle(title)
    .setDescription(description);
};

const startTransfer = async (
  source: ChatInputCommandInteraction | Message,
  userId: string,
  targetUser: User | null,
  amount: number,
  reason: string
): Promise<void> => {
  if (pendingTransfers.has(userId)) {
    await source.reply({
      embeds: [
        getErrorEmbed(
          `${emojis.status.error} Pending Transfer`,
          "You already have a pending transfer. Please complete or cancel it before making a new one."
        ),
      ],
    });

    return;
  }

  pendingTransfers.add(userId);

  if (!targetUser) {
    pendingTransfers.delete(userId);
    await source.reply({
      embeds: [createCommandGuideEmbed(command.name)],
    });

    return;
  }

  const targetUserId = targetUser.id;

  if (!amount || amount <= 0) {
    pendingTransfers.delete(userId);
    await source.reply({
      embeds: [
        getErrorEmbed(
          `${emojis.status.error} Invalid Amount`,
          "Please provide a valid amount."
        ),
      ],
    });

    return;
  }

  if (userId === targetUserId) {
    pendingTransfers.delete(userId);
    await source.reply({
      embeds: [
        getErrorEmbed(
          `${emojis.status.error} Self Transfer Detected`,
          "You cannot transfer coins to yourself."
        ),
      ],
    });

    return;
  }

  const balanceResult: ValidateBalanceResult = await validateBalance(
    userId,
    amount
  );

  if (balanceResult.error) {
    pendingTransfers.delete(userId);
    await source.reply({
      embeds: [
        getErrorEmbed(
          `${emojis.status.error} Insufficient Balance`,
          `You only have ${emojis.currency.coin} ${balanceResult.balance}, but tried to send ${emojis.currency.coin} ${amount}. You need ${emojis.currency.coin} ${balanceResult.difference} more.`
        ),
      ],
    });

    return;
  }

  const confirmationEmbed = getTransferConfirmationEmbed(
    targetUser,
    amount,
    reason
  );

  const row = getTransferConfirmationButtons();

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
    throw new Error("Unexpected input type!");
  }

  const filter = (interaction: ButtonInteraction) => {
    return (
      interaction.user.id === userId &&
      interaction.customId.startsWith("transfer_")
    );
  };

  const collector = confirmationMessage.createMessageComponentCollector({
    filter,
    componentType: ComponentType.Button,
    max: 1,
    time: transferTimeout * 1000,
  });

  collector.on("collect", async (interaction) => {
    pendingTransfers.delete(userId);

    const row = getTransferConfirmationButtons(true);
    await interaction.update({
      embeds: [confirmationEmbed],
      components: [row],
    });

    if (interaction.customId === "transfer_cancel") {
      return await interaction.followUp({
        embeds: [
          getErrorEmbed(
            `${emojis.status.error} Transfer Cancelled`,
            "Your transfer has been cancelled."
          ),
        ],
      });
    }

    const balanceResult = await validateBalance(userId, amount);

    if (balanceResult.error) {
      return await source.reply({
        embeds: [
          getErrorEmbed(
            "❌ Insufficient Balance",
            `You only have ${emojis.currency.coin} ${balanceResult.balance}, but tried to send ${emojis.currency.coin} ${amount}. You need ${emojis.currency.coin} ${balanceResult.difference} more.`
          ),
        ],
      });
    }

    await modifyBalance(userId, -amount);
    await modifyBalance(targetUserId, amount);

    const successEmbed = new EmbedBuilder()
      .setColor(colors.embed.status.success)
      .setTitle(`${emojis.status.success} Transfer Successful`)
      .setDescription(
        `You have successfully transferred ${emojis.currency.coin} **${amount}** to ${targetUser}.
        Reason: ${reason}`
      )
      .setFooter({
        text: getRandomTip(commandConfig.economy.name, command.name),
      });

    await interaction.followUp({
      embeds: [successEmbed],
    });

    return;
  });

  collector.on("end", async (collected) => {
    pendingTransfers.delete(userId);
    if (collected.size === 0) {
      const row = getTransferConfirmationButtons(true);
      await confirmationMessage.edit({
        embeds: [confirmationEmbed],
        components: [row],
      });

      const channel = source.channel as GuildTextBasedChannel;
      await channel.send({
        embeds: [
          getErrorEmbed(
            `${emojis.status.error} Transfer Cancelled`,
            "You took too long to respond. Your transfer has been cancelled."
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
    .addUserOption((option) => {
      return option
        .setName(command.args[0].name)
        .setDescription(command.args[0].description)
        .setRequired(command.args[0].required);
    })
    .addIntegerOption((option) => {
      return option
        .setName(command.args[1].name)
        .setDescription(command.args[1].description)
        .setRequired(command.args[1].required);
    })
    .addStringOption((option) => {
      return option
        .setName(command.args[2].name)
        .setDescription(command.args[2].description)
        .setRequired(command.args[2].required);
    }),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const targetUser = interaction.options.getUser(command.args[0].name);
    const amount = interaction.options.getInteger(command.args[1].name) ?? 0;
    const reason =
      interaction.options.getString(command.args[2].name) ||
      "*No reason provided*";

    await startTransfer(interaction, userId, targetUser, amount, reason);
  },

  async prefix(message: Message, args: string[]) {
    const userId = message.author.id;

    const amountArg = args.find((arg) => /^\d+$/.test(arg)) ?? "0";
    const amountIndex = args.indexOf(amountArg);
    const amount = parseInt(amountArg, 10) || 0;

    args.slice(amountIndex, 1);

    let targetUser = null;
    if (message.reference && message.mentions.repliedUser) {
      targetUser = message.mentions.users.first()!;
    }

    const reason = args.slice(args.indexOf(amountArg) + 1).join(" ");

    console.log("targetUser", targetUser?.id);
    console.log("userId", userId);
    console.log("amount", amount);
    console.log("reason", reason);

    await startTransfer(message, userId, targetUser, amount, reason);
  },
};
