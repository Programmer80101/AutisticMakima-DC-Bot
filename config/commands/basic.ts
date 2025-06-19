import bot from "../bot";
const prefix = bot.prefix;

const basic = {
  basic: {
    emoji: "🗒️",
    name: "Basic",
    description: "Basic commands for the bot.",
    footer: "These commands are available for all users.",
    commands: {
      help: {
        name: "help",
        emoji: "❓",
        cooldown: 3,
        description: "Displays a list of all commands.",
        aliases: ["help", "h"],
        usage: `${prefix}help [category | command]`,
        args: [
          {
            name: "category",
            type: "string",
            required: false,
            description: "Name of a category",
          },
          {
            name: "command",
            type: "string",
            required: false,
            description: "Name of a command",
          },
        ],
        tips: {
          default: `Use ${prefix}help to see a list of all commands.`,
          command: `Use ${prefix}help [command] to see how to use a specific command.`,
          category: `Use ${prefix}help [category] to see a list of commands in a category.`,
        },
      },
      info: {
        name: "info",
        emoji: "ℹ️",
        cooldown: 10,
        description: "Provides all necessary about the bot.",
        aliases: ["info"],
        usage: `${prefix}info`,
        args: [],
        examples: [
          {
            command: `${prefix}info`,
            note: "Displays necessary information about the bot.",
          },
        ],
        tips: {
          default: `Use ${prefix}info to see information about the bot.`,
        },
      },
      user: {
        name: "user",
        emoji: "👤",
        cooldown: 5,
        description: "Displays information about a user.",
        aliases: ["user", "u"],
        usage: `${prefix}user [user]`,
        args: [
          {
            name: "user",
            type: "user",
            required: false,
            description: "The user to get information about",
          },
        ],
        tips: {
          default: `Use ${prefix}user to see detailed info about yourself.`,
          user: `Use ${prefix}user [user] to see information about a specific user.`,
        },
      },
      ping: {
        name: "ping",
        emoji: "🏓",
        cooldown: 3,
        description: "Checks the latency of the bot.",
        aliases: ["ping", "p", "latency", "l"],
        usage: `${prefix}ping`,
        args: [],
        tips: {
          default: `Use ${prefix}ping to check the bot's latency.`,
        },
      },
      guide: {
        name: "guide",
        emoji: "📖",
        description: "Guide for using the bot.",
        aliases: ["guide"],
        usage: `${prefix}guide`,
        args: [],
        tips: {
          default: `Use ${prefix}guide see how to use the bot!`,
        },
      },
      rules: {
        name: "rules",
        emoji: "📜",
        description: "Rules for using the bot.",
        aliases: ["rules", "rules"],
        usage: `${prefix}rules`,
        args: [],
        tips: {
          default: `Use ${prefix}rules to understand the rules!`,
        },
      },
    },
  },
};

export default basic;
