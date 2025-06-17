import { SlashCommandBuilder } from "discord.js";

import commandConfig from "../../commands.js";

const command = commandConfig.basic.commands.ping;
const getLatency = (client) => `🏓 Pong! ${client.ws.ping}ms.`;

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction) {
    await interaction.reply(getLatency(interaction.client));
  },

  async prefix(message, args) {
    await message.reply(getLatency(message.client));
  },
};
