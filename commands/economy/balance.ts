import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  User,
  Message,
  Embed,
} from "discord.js";

import { getBalance } from "../../firebase/balance";
import { getRandomTip } from "../../utility/random";
import commands from "../../config/commands";
import colors from "../../config/colors";
import emojis from "../../config/emojis";

const command = commands.economy.commands.balance;

const sendBalance = async (
  source: ChatInputCommandInteraction | Message,
  user: User
): Promise<void> => {
  const balance = await getBalance(user.id);
  const balanceEmbed = new EmbedBuilder()
    .setColor(colors.embed.gold)
    .setTitle(`💰 Balance: ${user.username}`)
    .setDescription(`Financial record of ${user}!`)
    .setFields([
      {
        name: "Balance",
        value: `${emojis.currency.coin} ${balance}`,
      },
    ])
    .setFooter({
      text: getRandomTip(commands.economy.name, command.name),
    });

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

  async execute(interaction: ChatInputCommandInteraction) {
    const user =
      interaction.options.getUser(command.args[0].name) || interaction.user;
    await sendBalance(interaction, user);
  },

  async prefix(message: Message) {
    const mentioned = message.mentions.users.first();
    const user = mentioned || message.author;
    await sendBalance(message, user);
  },
};
