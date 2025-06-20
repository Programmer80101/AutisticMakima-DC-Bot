import { Events, Message, Collection, GuildTextBasedChannel } from "discord.js";

import { BotClient, CommandModule } from "../../types";
import { getStatusEmbed } from "../../utility/status-embed";
import { isProd } from "../../config";

import handleLootDrop from "../loot-drop";
import channels from "../../config/channels";
import events from "../../config/events";
import server from "../../config/server";
import users from "../../config/users";
import bot from "../../config/bot";

const prefix = bot.prefix;

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    if (message.author.bot || message.content.length <= 1) return;
    if (!message.guildId || !message.inGuild()) {
      return await message.reply({
        content: `You can only use my commands in <#${channels.allowedChannels}>!`,
      });
    }

    if (message.guildId != server.id) return;
    if (message.channelId == events.lootDrop.channelId) {
      await handleLootDrop(message);
    }

    if (!message.content.startsWith(prefix)) return;

    const channel = message.channel as GuildTextBasedChannel;
    const channelId = message.channelId;
    const channelName = channel?.name?.toLowerCase() ?? "";
    const allowedChannels = channels.allowedChannels;

    if (
      !allowedChannels.includes(channelId) &&
      !channelName.includes("ticket")
    ) {
      return await message.reply({
        content: `You can't use my commands here! They are available to use in <#${channels.defaultAllowedChannelId}>`,
      });
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args?.shift()?.toLowerCase() ?? "";

    const client = message.client as BotClient;
    const command: CommandModule | undefined =
      client?.commands?.get(commandName) ??
      client?.commands?.find((command) =>
        command.aliases?.includes(commandName)
      );

    if (!command) {
      return message.reply(
        `Command \`${commandName}\` not found. \nType \`${prefix}help\` for a list of commands.`
      );
    }

    const { cooldowns } = client;

    if (!cooldowns.has(command?.name)) {
      cooldowns.set(command?.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount =
      (command.cooldown ?? defaultCooldownDuration) * 1_000;

    const userId = message.author.id;
    if (timestamps?.has(userId)) {
      const lastUsed = timestamps?.get(userId)!;
      const expirationTime = lastUsed + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return message.reply({
          content: `Please wait, you are on a cooldown for \`${command.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
        });
      }
    }

    timestamps?.set(message.author.id, now);
    setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);

    if (command.status !== "enabled") {
      await message.reply({
        embeds: [getStatusEmbed(command.status)],
      });

      if (isProd) return;
    }

    try {
      await command.prefix(message, args);
    } catch (error) {
      console.error(error);
      message.reply(
        `Something went wrong while executing the command. \nContact <@${users.owner.id}> to help resolve this issue!`
      );
    }
  },
};
