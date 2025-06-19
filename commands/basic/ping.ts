import {
  ChatInputCommandInteraction,
  Client,
  Message,
  SlashCommandBuilder,
} from "discord.js";

import commandConfig from "../../config/commands";

const command = commandConfig.basic.commands.ping;
const getLatency = (client: Client) => `🏓 Pong! ${client.ws.ping}ms.`;

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply(getLatency(interaction.client));
  },

  async prefix(message: Message, _args: string[]) {
    await message.reply(getLatency(message.client));
  },
};
