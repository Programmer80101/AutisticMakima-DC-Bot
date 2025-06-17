import commandConfig from "./commands.js";
import config from "./config.js";

function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/['\W]+(.)?/g, (_, ch) => (ch ? ch.toUpperCase() : ""))
    .replace(/^./, (ch) => ch.toLowerCase());
}

function getItemId(name) {
  return toCamelCase(name);
}

const getRandomValue = (obj) => {
  const keys = Object.keys(obj);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return obj[randomKey];
};

const getRandomTip = (category, exception = "") => {
  const id = toCamelCase(category);
  const commands = commandConfig[id].commands;
  const keys = Object.keys(commands).filter((key) => key !== exception);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return getRandomValue(commands[randomKey].tips);
};

const parseTime = (string) => {
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };

  const regex = /(\d+)(\w+)/i;
  const match = string.match(regex);
  if (!match)
    return {
      success: false,
      duration: null,
    };

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multiplier = units[unit[0]];
  if (!multiplier)
    return {
      success: false,
      duration: null,
    };

  return {
    success: true,
    duration: value * multiplier,
  };
};

const createCommandGuideEmbed = (name) => {
  const query = name.toLowerCase();

  for (const category of Object.values(commandConfig)) {
    for (const cmd of Object.values(category.commands)) {
      if (
        cmd.name.toLowerCase() === query ||
        (cmd.aliases &&
          cmd.aliases.some((alias) => alias.toLowerCase() === query))
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
            value: cmd.aliases.map((a) => `\`${a}\``).join(", "),
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

        return {
          title: `Command Guide: \`${config.prefix}${cmd.name}\``,
          description: cmd.description || null,
          color: config.embed.color.default,
          fields,
          footer: {
            text: getRandomTip(category.name, cmd.name),
          },
        };
      }
    }
  }

  for (const category of Object.values(commandConfig)) {
    if (category.name.toLowerCase() === query) {
      const commandsList = Object.values(category.commands).map((cmd) => ({
        name: config.prefix + cmd.name,
        value: cmd.description ?? "No description.",
      }));

      return {
        title: `${category.emoji} ${category.name} Commands`,
        description: category.description,
        color: config.embed.color.default,
        fields: commandsList,
        footer: {
          text: getRandomTip(category.name),
        },
      };
    }
  }

  return {
    title: "Not Found",
    description: `No command or category found matching \`${name}\`.`,
    color: config.embed.color.red,
    footer: {
      text: commandConfig.basic.commands.help.default,
    },
  };
};

export {
  createCommandGuideEmbed,
  parseTime,
  getItemId,
  getRandomTip,
  getRandomValue,
};
