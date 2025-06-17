import { Events, Collection } from "discord.js";

import { getRandomTip } from "../utils.js";
import { addBalance } from "../utils/balance.js";
import commandConfig from "../commands.js";
import config from "../config.js";

const prefix = config.prefix;
const lastDropTimestamps = new Map();

export default {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.guildId) {
      return await message.reply({
        content: `You can only use my commands in <#${config.allowed.channels[0]}>!`,
      });
    }

    if (message.guildId != config.server.id) return;
    if (message.channelId == config.economy.coinDrop.channelId) {
      const now = Date.now();
      const last = lastDropTimestamps.get(message.author.id) || 0;
      if (now - last > config.economy.coinDrop.cooldownSeconds * 1000) {
        if (Math.random() <= config.economy.coinDrop.chance) {
          lastDropTimestamps.set(message.author.id, now);

          const winAmount = Math.ceil(Math.random() * 10);
          await addBalance(message.author.id, winAmount);

          const winEmbed = {
            color: config.embed.color.gold,
            title: "💰 Coin Drop!",
            description: `You won ${config.emoji.general.currency} **${winAmount}** coins for chatting!`,
            footer: {
              text: getRandomTip(commandConfig.economy.name),
            },
          };

          await message.reply({ embeds: [winEmbed] });
        }
      }
    }

    if (!message.content.startsWith(prefix)) return;

    const channel = message.channel;
    const channelId = message.channelId;
    const channelName = channel?.name?.toLowerCase() ?? "";
    const allowedChannels = config.allowed.channels;

    if (
      !allowedChannels.includes(channelId) &&
      !channelName.includes("ticket")
    ) {
      return await message.reply({
        content: `You can't use my commands here! They are available to use in <#${config.allowed.channels[0]}>`,
      });
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      message.client.commands.get(commandName) ||
      message.client.commands.find((cmd) => cmd.aliases?.includes(commandName));

    if (!command) {
      return message.reply(
        `Command \`${commandName}\` not found. \nType \`${prefix}help\` for a list of commands.`
      );
    }

    const { cooldowns } = message.client;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount =
      (command.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return message.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
        });
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      await command.prefix(message, args);
    } catch (error) {
      console.error(error);
      message.reply(
        `Something went wrong while executing the command. \nContact <@${config.owner.id}> to help resolve this issue!`
      );
    }
  },
};
