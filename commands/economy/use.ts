import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildTextBasedChannel,
  Message,
  SlashCommandBuilder,
} from "discord.js";

import { validateItemUse, useItem, getItemIdByName } from "../../firebase/item";
import { autoCompleteShopItems } from "../../utility/autocomplete";
import { getShopItemIdByName } from "../../firebase/shop";

import { createCommandGuideEmbed } from "../../utility/embed";
import { toKebabCase } from "../../utility/string";

import commandConfig from "../../config/commands";
import colors from "../../config/colors";
import emojis from "../../config/emojis";

const command = commandConfig.economy.commands.use;

const createErrorEmbed = (title: string, description: string): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(colors.embed.status.error)
    .setTitle(title)
    .setDescription(description);
};

const useItemFromInv = async (
  source: ChatInputCommandInteraction | Message,
  userId: string,
  itemName: string
) => {
  const itemId =
    getItemIdByName(itemName) ?? getShopItemIdByName(itemName) ?? "";
  const itemUseResult = await validateItemUse(userId, itemId);

  if (itemUseResult.error) {
    return await source.reply({
      embeds: [
        createErrorEmbed(itemUseResult.title, itemUseResult.description),
      ],
    });
  }

  if (itemUseResult.item.autoClaim) {
    await useItem(userId, itemId);
    try {
      const itemModule = await import(
        `../../events/use-item/${toKebabCase(itemUseResult.item.id)}.js`
      );

      await itemModule.default(userId, source);
    } catch (error) {
      console.error(
        `Error using item ${itemUseResult.item.id} for user ${userId}:`,
        error
      );
    }

    return;
  }

  const channel = source.channel as GuildTextBasedChannel;

  if (!channel.name.toLowerCase().includes("ticket")) {
    return await source.reply({
      embeds: [
        createErrorEmbed(
          "❌ Invalid Channel",
          "You can only use this item in a ticket channel."
        ),
      ],
    });
  }

  await useItem(userId, itemId);

  const successEmbed = new EmbedBuilder()
    .setColor(colors.embed.status.success)
    .setTitle(`${emojis.status.success} Item Used Successfully`)
    .setDescription(
      `You claimed ${itemUseResult.item.emoji} **${itemUseResult.item.name}**!\nAsk a staff member to complete this action.`
    );

  await source.reply({
    embeds: [successEmbed],
  });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .addStringOption((option) => {
      return option
        .setName(command.args[0].name)
        .setDescription(command.args[0].description)
        .setRequired(command.args[0].required)
        .setAutocomplete(true);
    }),

  async autocomplete(interaction: AutocompleteInteraction) {
    await autoCompleteShopItems(interaction);
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const itemName = interaction.options.getString(command.args[0].name) ?? "";
    await useItemFromInv(interaction, interaction.user.id, itemName);
  },

  async prefix(message: Message) {
    const [, ...args] = message.content.trim().split(/\s+/);
    if (args.length === 0) {
      return await message.reply({
        embeds: [createCommandGuideEmbed(command.name)],
      });
    }

    const itemName = args.join(" ");

    await useItemFromInv(message, message.author.id, itemName);
  },
};
