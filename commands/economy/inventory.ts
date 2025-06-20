import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
  User,
  APIEmbedField,
  EmbedBuilder,
} from "discord.js";

import { getInventory } from "../../firebase/inventory";
import { getShopItemById } from "../../firebase/shop";
import { getItemById } from "../../firebase/item";
import { getRandomTip } from "../../utility/random";
import commandConfig from "../../config/commands";
import colors from "../../config/colors";

const command = commandConfig.economy.commands.inventory;

const sendInventory = async (
  source: ChatInputCommandInteraction | Message,
  user: User
): Promise<void> => {
  const inventory: Record<string, number> = (await getInventory(user.id)) || {};

  const fieldPromises = Object.entries(inventory).map(
    async ([itemId, amount]) => {
      const item = getItemById(itemId) || (await getShopItemById(itemId));
      return {
        name: `${item?.emoji} ${item?.name}`,
        value: `Amount: ${amount}`,
      } satisfies APIEmbedField;
    }
  );

  const fields =
    Object.keys(inventory).length > 0
      ? await Promise.all(fieldPromises)
      : [
          {
            name: "No items",
            value: "You have no items in your inventory.",
          },
        ];

  const inventoryEmbed = new EmbedBuilder()
    .setColor(colors.embed.status.info)
    .setTitle(`${command.emoji} Inventory: ${user.username}`)
    .setDescription(`Inventory of ${user}!`)
    .setFields(fields)
    .setFooter({
      text: getRandomTip(commandConfig.economy.name, command.name),
    });

  await source.reply({ embeds: [inventoryEmbed] });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction: ChatInputCommandInteraction) {
    await sendInventory(interaction, interaction.user);
  },

  async prefix(message: Message) {
    await sendInventory(message, message.author);
  },
};
