import config from "../../config.js";
const prefix = config.prefix;

export default {
  economy: {
    emoji: "💰",
    name: "Economy",
    description: "Economy commands for coins.",
    footer: "These commands are available for all users.",
    commands: {
      shopset: {
        name: "shopset",
        cooldown: 10,
        emoji: "🛒",
        description: "Modify the shop items.",
        aliases: ["ss", "shopset"],
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
      addbalance: {
        name: "addbalance",
        cooldown: 10,
        emoji: "🛒",
        description: "Change the balance of a user.",
        aliases: ["add", "addbal", "addbalance"],
        usage: `${prefix}shopset (item_name) [item_emoji] [item_description] [item_price] [item_stock] [item_auto_claim]`,
        args: [
          {
            name: "user",
            type: "user",
            required: true,
            description: "User to change balance for.",
          },
          {
            name: "balance",
            type: "integer",
            required: true,
            description: "Change in balance.",
          },
        ],
      },
    },
  },
};
