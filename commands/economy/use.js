import { SlashCommandBuilder } from "discord.js";

import { createCommandGuideEmbed, getItemId } from "../../utils.js";
import { autoCompleteShopItems } from "../../utils/autocomplete.js";
import { checkUseItem, useItem } from "../../utils/item.js";
import commandConfig from "../../commands.js";
import config from "../../config.js";

const command = commandConfig.economy.commands.use;

const createErrorEmbed = (title, message) => {
  return {
    color: config.embed.color.red,
    title: title,
    description: message,
  };
};

const useItemFromInv = async (source, userId, itemId) => {
  const res = await checkUseItem(userId, itemId);
  if (res.error) {
    return await source.reply({
      embeds: [createErrorEmbed(res.title, res.message)],
    });
  }

  if (res.item.autoClaim) {
    await useItem(userId, itemId);
    return await source.reply({
      content: `✅ You used **${res.item.emoji} ${res.item.name}** and it took effect immediately!`,
    });
  }

  if (!source.channel.name.toLowerCase().includes("ticket")) {
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

  const successEmbed = {
    color: config.embed.color.green,
    title: "✅ Item Used Successfully",
    description: `You used ${res.item.emoji} **${res.item.name}**! Ask a staff member to complete this action.`,
  };

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

  async autocomplete(interaction) {
    await autoCompleteShopItems(interaction);
  },

  async execute(interaction) {
    const itemName = interaction.options.getString(command.args[0].name);
    await useItemFromInv(interaction, interaction.user.id, getItemId(itemName));
  },

  async prefix(message) {
    const [, ...args] = message.content.trim().split(/\s+/);
    if (args.length === 0) {
      return await message.reply({
        embeds: [createCommandGuideEmbed(command.name)],
      });
    }

    const itemName = args.join(" ");

    await useItemFromInv(message, message.author.id, getItemId(itemName));
  },
};
