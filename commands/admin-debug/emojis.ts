import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
} from "discord.js";

import adminCommands from "../../config/admin-commands";
import emojis from "../../config/emojis";

function formatEmojiSection(title: string, obj: Record<string, string>) {
  return (
    `**${title}**\n` +
    Object.entries(obj)
      .map(([key, val]) => `\`${key}\`: ${val}`)
      .join("\n")
  );
}

const command = adminCommands.debug.commands.emojis;

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle("📙 Emoji Reference")
      .setColor(0xffd700) // gold

      .addFields(
        {
          name: "Currency",
          value: formatEmojiSection("Currency", emojis.currency),
          inline: false,
        },
        {
          name: "Item",
          value: formatEmojiSection("Item", emojis.item),
          inline: false,
        },
        {
          name: "Status",
          value: formatEmojiSection("Status", emojis.status),
          inline: false,
        },
        {
          name: "Misc",
          value: `📥 \`in\`\n📤 \`out\`\n⏱️ \`duration\``,
          inline: false,
        }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  async prefix(_message: Message) {
    return;
  },
};
