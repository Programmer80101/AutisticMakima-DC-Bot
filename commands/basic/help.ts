import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from "discord.js";

import { createCommandGuideEmbed } from "../../utility/embed";
import { getRandomTip } from "../../utility/random";
import commandConfig from "../../config/commands";
import colors from "../../config/colors";

const command = commandConfig.basic.commands.help;

const fields = Object.values(commandConfig).map((category) => ({
  name: `${category.emoji} ${category.name}`,
  value:
    Object.values(category.commands)
      .map((cmd) => `\`${cmd.name}\``)
      .join(", ") || "*None*",
}));

const helpEmbed = {
  color: colors.embed.status.info,
  title: "📘 Command Guide",
  description: "List of all available commands with categories!",
  footer: { text: getRandomTip(commandConfig.basic.name, command.name) },
  fields,
};

const executeCommand = async (
  source: ChatInputCommandInteraction | Message,
  text: string
) => {
  if (!text) {
    return await source.reply({ embeds: [helpEmbed] });
  }

  await source.reply({ embeds: [createCommandGuideEmbed(text)] });
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
        .setRequired(command.args[0].required);
    }),

  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString(command.args[0].name) ?? "";
    executeCommand(interaction, text);
  },

  async prefix(message: Message, args: string[]) {
    const text = args.join(" ");
    executeCommand(message, text);
  },
};
