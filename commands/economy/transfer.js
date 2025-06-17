import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";

import { createCommandGuideEmbed, getRandomTip } from "../../utils.js";
import { checkBalance, addBalance } from "../../utils/balance.js";
import commandConfig from "../../commands.js";
import config from "../../config.js";

const command = commandConfig.economy.commands.transfer;
const pendingTransfers = new Set();

const getTransferConfirmationButtons = (disabled = false) => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("transfer_confirm")
      .setLabel("✅ Confirm")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("transfer_cancel")
      .setLabel("❌ Cancel")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
};

const getTransferConfirmationEmbed = (targetUser, amount, reason) => {
  return {
    color: config.embed.color.default,
    title: `${command.emoji} Transfer Confirmation`,
    description: `Are you sure you want to transfer ${config.emoji.general.currency} **${amount}** to ${targetUser}?`,
    fields: [
      {
        name: "User",
        value: targetUser.toString(),
        inline: true,
      },
      {
        name: "Amount",
        value: `${config.emoji.general.currency} ${amount}`,
        inline: true,
      },
      {
        name: "Reason",
        value: reason || "*No reason provided*",
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

const startTransfer = async (source, userId, targetUser, amount, reason) => {
  if (pendingTransfers.has(userId)) {
    return await source.reply({
      embeds: [
        getErrorEmbed(
          "❌ Pending Transfer",
          "You already have a pending transfer. Please complete or cancel it before making a new one."
        ),
      ],
    });
  }

  pendingTransfers.add(userId);

  if (!targetUser) {
    pendingTransfers.delete(userId);
    return await source.reply({
      embeds: [createCommandGuideEmbed(command.name)],
    });
  }

  const targetUserId = targetUser.id;

  if (!amount || amount <= 0) {
    pendingTransfers.delete(userId);
    return await source.reply({
      embeds: [
        getErrorEmbed("❌ Invalid Amount", "Please provide a valid amount."),
      ],
    });
  }

  if (userId === targetUserId) {
    pendingTransfers.delete(userId);
    return await source.reply({
      embeds: [
        getErrorEmbed(
          "❌ Self Transfer Detected",
          "You cannot transfer coins to yourself."
        ),
      ],
    });
  }

  const { error, balance, difference } = await checkBalance(userId, amount);

  if (error) {
    pendingTransfers.delete(userId);
    return await source.reply({
      embeds: [
        getErrorEmbed(
          "❌ Insufficient Balance",
          `You only have ${config.emoji.general.currency} ${balance}, but tried to send ${config.emoji.general.currency} ${amount}. You need ${config.emoji.general.currency} ${difference} more.`
        ),
      ],
    });
  }

  const confirmationEmbed = getTransferConfirmationEmbed(
    targetUser,
    amount,
    reason
  );

  const row = getTransferConfirmationButtons();

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
    return i.user.id === userId && i.customId.startsWith("transfer_");
  };

  const collector = confirmationMessage.createMessageComponentCollector({
    filter,
    max: 1,
    time: 30_000,
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
            "❌ Transfer Cancelled",
            "Your transfer has been cancelled."
          ),
        ],
      });
    }

    const { error, balance, difference } = await checkBalance(userId, amount);
    if (error) {
      return await source.reply({
        embeds: [
          getErrorEmbed(
            "❌ Insufficient Balance",
            `You only have ${config.emoji.general.currency} ${balance}, but tried to send ${config.emoji.general.currency} ${amount}. You need ${config.emoji.general.currency} ${difference} more.`
          ),
        ],
      });
    }

    await addBalance(userId, -amount);
    await addBalance(targetUserId, amount);
    const successEmbed = {
      color: config.embed.color.green,
      title: `✅ Transfer Successful`,
      description: `You have successfully transferred ${config.emoji.general.currency} **${amount}** to ${targetUser}. \nReason: ${reason}`,
      footer: {
        text: getRandomTip(commandConfig.economy.name, command.name),
      },
    };

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

      await source.channel.send({
        embeds: [
          getErrorEmbed(
            "❌ Transfer Cancelled",
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

  async execute(interaction) {
    const userId = interaction.user.id;
    const targetUser = interaction.options.getUser(command.args[0].name);
    const amount = interaction.options.getInteger(command.args[1].name);
    const reason =
      interaction.options.getString(command.args[2].name) ||
      "*No reason provided*";

    await startTransfer(interaction, userId, targetUser, amount, reason);
  },

  async prefix(message, args) {
    const userId = message.author.id;

    const amountArg = args.find((arg) => /^\d+$/.test(arg));
    const amountIndex = args.indexOf(amountArg);
    const amount = parseInt(amountArg, 10) || 0;

    args.slice(amountIndex, 1);

    let targetUser = null;
    if (message.reference && message.mentions.repliedUser) {
      targetUser = message.mentions.users.first();
    }

    const reason = "";

    console.log("targetUser", targetUser.id);
    console.log("repliedUserId", repliedUser.id);
    console.log("userId", userId);
    console.log("amount", amount);
    console.log("reason", reason);

    await startTransfer(message, userId, targetUser, amount, reason);
  },
};
