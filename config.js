import path from "path";
import dotenv from "dotenv";

const envMode = process.env.NODE_ENV.trim() || "production";
const envFile = path.resolve(import.meta.dirname, `.env.${envMode}`);

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

dotenv.config({ path: envFile });

console.log(`🔒 Environment Mode: ${capitalizeFirstLetter(envMode)}`);

if (envMode != "development") {
  console.log(`⚠️ Alert: You are not in development mode!`);
}

const prefix = "!";
const isDev = envMode === "development";

const config = {
  name: isDev ? "Dev Discord Bot" : "Discord Bot",
  isDev: isDev,
  isProd: !isDev,
  prefix: prefix,
  iconURL: "https://images.app.goo.gl/6uZ9YvYERfWabBS27",
  cooldown: {
    default: 1,
    mod: 10,
    economy: 3,
  },
  economy: {
    daily: {
      amount: 10,
      cooldownHours: 23,
    },
    coinDrop: {
      chance: 0.25,
      cooldownSeconds: 15,
      range: [0, 10],
      channelId: isDev ? "1384134813304229982" : "",
    },
  },
  owner: {
    id: "855342398115414037",
    name: "Pikachu",
  },
  ownerAlt: {
    id: "1369969377235046400",
    name: "Charizard",
  },
  embed: {
    color: {
      neutral: 0x636363,
      default: 0x0099ff,
      purple: 0x992bff,
      yellow: 0xd4d440,
      green: 0x27c027,
      gold: 0xffd900,
      red: 0xd43636,
    },
  }, //
  server: {
    id: isDev ? "1384134812801175642" : "",
  },
  allowed: {
    channels: [
      // " ", // juice wrld coin
      // " ", // staff bot commands
      // " ", // bot commands
      "1384146194304860325", // dev -> bot
    ],
  },
  channel: {
    log: "",
  },
  items: {},
  emoji: {
    general: {
      duration: "⏱️",
      cabinet: "🗄️",
      coin: "🪙",
      currency: "🪙",
    },
  }, //
  errors: {
    mod: {
      somethingWentWrong: "⚠️ Something went wrong",
      selfSabotage: "🔰 Self Sabotage",
      roleHierarchy: "📊 Improper Role Heirarchy",
      insufficientPermissions: "⛔ Insufficient Permissions",
      invalidArguments: "❌ Invalid Arguments",
      invalidDuration: "⏱️ Invalid Duration",
    },
  }, //
};

export default config;
