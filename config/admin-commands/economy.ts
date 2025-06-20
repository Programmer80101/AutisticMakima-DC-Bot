import { CommandShape } from "../../types";
import bot from "../bot";

const prefix = bot.prefix;

const economy: {
  economy: {
    emoji: string;
    name: string;
    description: string;
    footer: string;
    commands: Record<string, Omit<CommandShape, "aliases" | "status" | "tips">>;
  };
} = {
  economy: {
    emoji: "💰",
    name: "Economy",
    description: "Economy commands for coins.",
    footer: "These commands are only available for admins.",
    commands: {
      shopset: {
        name: "shopset",
        cooldown: 10,
        emoji: "🛒",
        description: "Modify the shop items.",
        usage: `${prefix}shopset (item_name) [item_emoji] [item_description] [item_price] [item_stock] [item_auto_claim]`,
        args: [
          {
            name: "item_name",
            type: "string",
            required: true,
            description: "Name of the item.",
          },
          {
            name: "item_emoji",
            type: "string",
            required: false,
            description: "Emoji for the item.",
          },
          {
            name: "item_description",
            type: "string",
            required: false,
            description: "Description of the item.",
          },
          {
            name: "item_price",
            type: "integer",
            required: false,
            description: "Price of the item.",
          },
          {
            name: "item_stock",
            type: "integer",
            required: false,
            description: "Stock of the item.",
          },
          {
            name: "item_auto_claim",
            type: "boolean",
            required: false,
            description: "Whether the item can be auto claimed.",
          },
        ],
      },
      modifybalance: {
        name: "modifybalance",
        cooldown: 10,
        emoji: "🛒",
        description: "Change the balance of a user.",
        usage: `${prefix}modifyBalance (delta) [user]`,
        args: [
          {
            name: "delta",
            type: "integer",
            required: true,
            description: "Change in balance.",
          },
          {
            name: "user",
            type: "user",
            required: false,
            description: "User to change balance for.",
          },
        ],
      },
    },
  },
};

export default economy;
