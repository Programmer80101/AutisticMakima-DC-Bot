import { isDev } from "../config";

const events = {
  lootDrop: {
    quantityOdds: {
      1: 0.5,
      2: 0.4,
      3: 0.1,
    },
    channelId: isDev ? "1384134813304229982" : "1383090638647464030", // general
    probability: isDev ? 1 : 1 / 35,
    cooldownSeconds: isDev ? 10 : 30,
  },
};

export default events;
