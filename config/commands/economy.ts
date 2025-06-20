import { CommandShape } from "../../types";
import bot from "../bot";
import currencies from "../currencies";

const prefix = bot.prefix;

const economy: {
  economy: {
    emoji: string;
    name: string;
    description: string;
    footer: string;
    commands: Record<string, CommandShape>;
  };
} = {
  economy: {
    emoji: "💰",
    name: "Economy",
    description: "Economy commands for coins.",
    footer: "These commands are available for all users.",
    commands: {
      balance: {
        name: "balance",
        emoji: "🪙",
        cooldown: 5,
        status: "enabled",
        description: "Get your current balance.",
        aliases: ["balance", "bal"],
        usage: `${prefix}balance [user]`,
        args: [
          {
            name: "user",
            type: "user",
            required: false,
            description: "The user to get balance of",
          },
        ],
        tips: {
          default: `Use ${prefix}balance to check your balance`,
          user: `Use ${prefix}balance [user] to check a user's balance`,
        },
      },
      daily: {
        name: "daily",
        emoji: "💸",
        cooldown: 5,
        status: "enabled",
        description: "Collect your daily coins",
        aliases: ["daily"],
        usage: `${prefix}daily`,
        args: [],
        tips: {
          default: `Use ${prefix}daily to collect your daily free coins!`,
        },
      },
      shop: {
        name: "shop",
        emoji: "🛍️",
        cooldown: 10,
        status: "enabled",
        description: "Check out the shop for cool items!",
        aliases: ["shop"],
        usage: `${prefix}shop`,
        args: [],
        tips: {
          default: `Use ${prefix}shop to see cool items in the shop!`,
        },
      },
      buy: {
        name: "buy",
        emoji: "🛒",
        cooldown: 5,
        status: "enabled",
        description: "Buy an item from the shop!",
        aliases: ["buy"],
        usage: `${prefix}buy (item_name) [quantity]`,
        args: [
          {
            name: "item_name",
            type: "string",
            required: true,
            description: "The item that you want to buy!",
          },
          {
            name: "quantity",
            type: "integer",
            required: false,
            description: "Amount of items to buy!",
          },
        ],
        tips: {
          default: `Use ${prefix}buy (item_name) to buy an item`,
          quantity: `User ${prefix}buy (item_name) [quantity] to by multiple items at once!`,
        },
      },
      inventory: {
        name: "inventory",
        emoji: "📦",
        cooldown: 5,
        status: "enabled",
        description: "Check your inventory!",
        aliases: ["inv", "inven", "inventory"],
        usage: `${prefix}inventory`,
        args: [],
        tips: {
          default: `Use ${prefix}inventory to see your inventory`,
        },
      },
      use: {
        name: "use",
        emoji: "🛠️",
        cooldown: 5,
        status: "enabled",
        description: "Use an item from your inventory!",
        aliases: ["use"],
        usage: `${prefix}use (item_name) [quantity]`,
        args: [
          {
            name: "item_name",
            type: "string",
            required: true,
            description: "The item that you want to buy!",
          },
          {
            name: "quantity",
            type: "integer",
            required: false,
            description: "Amount of items to use!",
          },
        ],
        tips: {
          default: `Use ${prefix}use (item_name) to use an item`,
          quantity: `Use ${prefix}use (item_name) [quantity] to use mutiple item at once!`,
        },
      },
      transfer: {
        name: "transfer",
        emoji: "🔄",
        cooldown: 10,
        status: "comingSoon",
        description: `Transfer ${currencies.coin.emoji} ${currencies.coin.name} to another user`,
        aliases: ["transfer"],
        usage: `${prefix}transfer (user) (amount) [reason]`,
        args: [
          {
            name: "user",
            type: "user",
            required: true,
            description: `The user you want to transfer ${currencies.coin.emoji} ${currencies.coin.name} to`,
          },
          {
            name: "amount",
            type: "integer",
            required: true,
            description: "Amount of coins to transfer",
          },
          {
            name: "reason",
            type: "string",
            required: false,
            description: "Reason for the transfer",
          },
        ],
        tips: {
          default: `You can use ${prefix}transfer (amount) [reason] to transfer coins to another user!`,
        },
      },
    },
  },
};

export default economy;
