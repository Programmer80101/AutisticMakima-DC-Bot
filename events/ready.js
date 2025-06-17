import { Events } from "discord.js";
import { initCache } from "../cache.js";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await initCache();
    console.log(`🤖 Logged in as ${client.user.tag}`);
  },
};
