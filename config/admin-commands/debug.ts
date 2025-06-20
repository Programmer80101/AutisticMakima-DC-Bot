import { CommandShape } from "../../types";
import bot from "../bot";

const prefix = bot.prefix;

const debug: {
  debug: {
    emoji: string;
    name: string;
    description: string;
    footer: string;
    commands: Record<string, Omit<CommandShape, "aliases" | "status" | "tips">>;
  };
} = {
  debug: {
    emoji: "🐞",
    name: "Debug",
    description: "Debug commands for troubleshooting.",
    footer: "These commands are only available for admins.",
    commands: {
      emojis: {
        name: "emojis",
        cooldown: 10,
        emoji: "😀",
        description: "Debug emojis.",
        usage: `${prefix}emojis `,
        args: [],
      },
    },
  },
};

export default debug;
