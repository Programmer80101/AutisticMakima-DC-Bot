import { SlashCommandBuilder } from "discord.js";

import { getBalance } from "../../utils/balance.js";
import { getRandomTip } from "../../utils.js";
import commandConfig from "../../commands.js";
import config from "../../config.js";

const command = commandConfig.economy.commands.balance;

const sendBalance = async (source, user) => {
  const balance = await getBalance(user.id);
  const balanceEmbed = {
    color: config.embed.color.gold,
    title: `💰 Balance: ${user.username}`,
    description: `Financial record of ${user}!`,
    fields: [
      {
        name: "Balance",
        value: `${config.emoji.general.currency} ${balance}`,
      },
    ],
    footer: {
      text: getRandomTip(commandConfig.economy.name, command.name),
    },
  };

  await source.reply({ embeds: [balanceEmbed] });
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
    }),

  async execute(interaction) {
    const user =
      interaction.options.getUser(command.args[0].name) || interaction.user;
    await sendBalance(interaction, user);
  },

  async prefix(message) {
    const mentioned = message.mentions.users.first();
    const user = mentioned || message.author;
    await sendBalance(message, user);
  },
};
