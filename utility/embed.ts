import { EmbedBuilder } from "discord.js";

import { getRandomTip } from "./random.js";
import commands from "../config/commands.js";
import colors from "../config/colors.js";
import bot from "../config/bot.js";

const prefix = bot.prefix;

export const createEmbed = (
  color: number,
  title: string,
  description: string,
  footer: string
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: footer });
};

export const createErrorEmbed = (
  title: string,
  description: string,
  footer: string
): EmbedBuilder => {
  return createEmbed(colors.embed.status.error, title, description, footer);
};

export const createSuccessEmbed = (
  title: string,
  description: string,
  footer: string
): EmbedBuilder => {
  return createEmbed(colors.embed.status.success, title, description, footer);
};

export const createCommandGuideEmbed = (name: string): EmbedBuilder => {
  const query = name.toLowerCase();

  for (const category of Object.values(commands)) {
    for (const cmd of Object.values(category.commands)) {
      if (
        cmd.name.toLowerCase() === query ||
        (cmd.aliases &&
          cmd.aliases.some(
            (alias: string): boolean => alias.toLowerCase() === query
          ))
      ) {
        const fields = [
          {
            name: "📁 Category",
            value: category.name,
            inline: true,
          },
          {
            name: "🪪 Name",
            value: `${cmd.emoji} ${cmd.name}`,
            inline: true,
          },
          {
            name: "ℹ️ Description",
            value: cmd.description || "No description provided.",
            inline: false,
          },
        ];

        if (cmd.aliases && cmd.aliases.length > 0) {
          fields.push({
            name: "🔀 Aliases",
            value: cmd.aliases
              .map((alias: string): string => `\`${alias}\``)
              .join(", "),
            inline: false,
          });
        }

        if (cmd.usage) {
          fields.push({
            name: "⚙️ Usage",
            value: `\`${cmd.usage}\``,
            inline: false,
          });
        }

        if (cmd.notes) {
          fields.push({
            name: "📄 Note",
            value: cmd.notes.join("\n"),
            inline: false,
          });
        }

        if (cmd.cooldown) {
          fields.push({
            name: "⏱️ Cooldown",
            value: `${cmd.cooldown}s`,
            inline: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor(colors.embed.status.info)
          .setTitle(`Command Guide: \`${prefix}${cmd.name}\``)
          .setDescription(cmd.description || "")
          .setFields(fields)
          .setFooter({ text: getRandomTip(category.name, cmd.name) });

        return embed;
      }
    }
  }

  for (const category of Object.values(commands)) {
    if (category.name.toLowerCase() === query) {
      const commandsList = Object.values(category.commands).map((cmd) => ({
        name: prefix + cmd.name,
        value: cmd.description ?? "No description.",
      }));

      const embed = new EmbedBuilder()
        .setTitle(`${category.emoji} ${category.name} Commands`)
        .setDescription(category.description)
        .setColor(colors.embed.status.info)
        .setFields(commandsList)
        .setFooter({
          text: getRandomTip(category.name),
        });

      return embed;
    }
  }

  const embed = new EmbedBuilder()
    .setTitle("Not Found")
    .setDescription(`No command or category found matching \`${name}\`.`)
    .setColor(colors.embed.status.error)
    .setFooter({
      text: commands.basic.commands.help.tips.default,
    });

  return embed;
};
