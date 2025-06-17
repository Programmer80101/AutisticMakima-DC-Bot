import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

import commandsData from "../../adminCommands.js";
import { addBalance } from "../../utils/balance.js";

const command = commandsData.economy.commands.addbalance;

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((option) =>
      option
        .setName(commandsData.economy.commands.addbalance.args[0].name)
        .setDescription(
          commandsData.economy.commands.addbalance.args[0].description
        )
        .setRequired(commandsData.economy.commands.addbalance.args[0].required)
    )
    .addIntegerOption((option) =>
      option
        .setName(commandsData.economy.commands.addbalance.args[1].name)
        .setDescription(
          commandsData.economy.commands.addbalance.args[1].description
        )
        .setRequired(commandsData.economy.commands.addbalance.args[1].required)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser(
      commandsData.economy.commands.addbalance.args[0].name
    );
    const amount = interaction.options.getInteger(
      commandsData.economy.commands.addbalance.args[1].name
    );

    await interaction.deferReply({
      content: `Updating balance of user **${user}**...`,
      flags: MessageFlags.Ephemeral,
    });

    await addBalance(user.id, amount);

    await interaction.editReply({
      content: `Balance for **${user}** has been updated!`,
      flags: MessageFlags.Ephemeral,
    });
  },

  async prefix(message) {
    return;
  },
};
