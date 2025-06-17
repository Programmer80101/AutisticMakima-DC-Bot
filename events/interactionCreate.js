import { Events, MessageFlags, Collection } from "discord.js";

import config from "../config.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isMessageComponent()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    if (interaction.isAutocomplete()) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }

      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const channel = interaction.channel;
    const channelId = interaction.channelId;
    const channelName = channel?.name?.toLowerCase() ?? "";
    const allowedChannels = config.allowed.channels;

    if (
      !allowedChannels.includes(channelId) &&
      !channelName.includes("ticket")
    ) {
      return await interaction.reply({
        content: `${config.emoji.general.error} You can't use my commands here! \nThey are available to use in <#${config.allowed.channels[0]}>`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount =
      (command.cooldown ?? config.cooldown.default) * 1_000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return interaction.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `${config.emoji.general.error} Something went wrong while executing the command. Contact <@${config.owner.id}>to resolve this issue!`,
      });
    }
  },
};
