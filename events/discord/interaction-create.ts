import {
  Events,
  MessageFlags,
  Collection,
  CommandInteraction,
  GuildTextBasedChannel,
} from "discord.js";

import { CommandModule, BotClient } from "../../types";
import { getStatusEmbed } from "../../utility/status-embed";

import channels from "../../config/channels";
import emojis from "../../config/emojis";
import users from "../../config/users";
import bot from "../../config/bot";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: CommandInteraction) {
    if (interaction.isMessageComponent()) return;

    const client = interaction.client as BotClient;
    const command = client.commands.get(interaction.commandName) as
      | CommandModule
      | undefined;

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

    const channel = interaction.channel as GuildTextBasedChannel;
    const channelId = interaction.channelId;
    const channelName = channel?.name?.toLowerCase() ?? "";
    const allowedChannels = channels.allowedChannels;

    if (
      !allowedChannels.includes(channelId) &&
      !channelName.includes("ticket")
    ) {
      return await interaction.reply({
        content: `${emojis.status.error} You can't use my commands here! \nThey are available to use in <#${channels.defaultAllowedChannelId}>`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const { cooldowns } = client;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown ?? bot.cooldowns.default) * 1_000;

    if (timestamps?.has(interaction.user.id)) {
      const lastUsed = timestamps.get(interaction.user.id)!;
      const expirationTime = lastUsed + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return interaction.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    timestamps?.set(interaction.user.id, now);
    setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

    if (command.status && command.status !== "enabled") {
      await interaction.reply({
        embeds: [getStatusEmbed(command.status)],
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `${emojis.status.error} Something went wrong while executing the command. Contact <@${users.owner.id}>to resolve this issue!`,
      });
    }
  },
};
