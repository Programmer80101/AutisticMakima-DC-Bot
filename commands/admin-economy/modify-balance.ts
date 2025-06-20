import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";

import adminCommands from "../../config/admin-commands";
import { modifyBalance } from "../../firebase/balance";

const command = adminCommands.economy.commands.modifybalance;

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((option) =>
      option
        .setName(adminCommands.economy.commands.modifybalance.args[0].name)
        .setDescription(
          adminCommands.economy.commands.modifybalance.args[0].description
        )
        .setRequired(
          adminCommands.economy.commands.modifybalance.args[0].required
        )
    )
    .addUserOption((option) =>
      option
        .setName(adminCommands.economy.commands.modifybalance.args[1].name)
        .setDescription(
          adminCommands.economy.commands.modifybalance.args[1].description
        )
        .setRequired(
          adminCommands.economy.commands.modifybalance.args[1].required
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const delta =
      interaction.options.getInteger(
        adminCommands.economy.commands.modifybalance.args[0].name
      ) ?? 0;
    const user =
      interaction.options.getUser(
        adminCommands.economy.commands.modifybalance.args[1].name
      ) || interaction.user;

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    await modifyBalance(user.id, delta);

    await interaction.editReply({
      content: `Balance for **${user}** has been updated!`,
    });
  },

  async prefix(_message: Message) {
    return;
  },
};
