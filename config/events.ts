import {isDev} from "../config";

const events = {
  lootDrop: {
    channelId: isDev ? "1384134813304229982" : "1383090638647464030",
    probability: isDev ? 0.25 : 0.1,
    cooldownSeconds: isDev ? 10 : 60,
  },
};

export default events;
