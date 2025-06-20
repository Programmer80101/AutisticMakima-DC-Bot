import { Message } from "discord.js";

import { modifyInventoryItem } from "../firebase/inventory";
import { getRandomTip, pickWeightedOption, random } from "../utility/random";
import { createEmbed } from "../utility/embed";
import commands from "../config/commands";
import colors from "../config/colors";
import events from "../config/events";
import server from "../config/server";
import items from "../config/items";

const lastDropTimestamps = new Map<string, number>();

export default async function handleLootDrop(message: Message): Promise<void> {
  if (
    message.channelId !== events.lootDrop.channelId ||
    message.author.bot ||
    !message.inGuild() ||
    message.guildId !== server.id
  )
    return;

  const now = Date.now();
  const last = lastDropTimestamps.get(message.author.id) || 0;

  if (now - last <= events.lootDrop.cooldownSeconds * 1000) return;

  if (!random.bool(events.lootDrop.probability)) return;

  const quantityOdds = events.lootDrop.quantityOdds;
  const quantity = pickWeightedOption(quantityOdds);

  lastDropTimestamps.set(message.author.id, now);

  await modifyInventoryItem(message.author.id, "moneyBag", Number(quantity));

  await message.reply({
    embeds: [
      createEmbed(
        colors.embed.gold,
        `💎 You found some loot!`,
        `You found **${quantity}x ${items.moneyBag.emoji} ${items.moneyBag.name}**`,
        getRandomTip(commands.economy.name)
      ),
    ],
  });
}
