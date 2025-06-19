import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  SlashCommandBuilder,
} from "discord.js";

import currencies from "../../config/currencies";
import commands from "../../config/commands";
import colors from "../../config/colors";
import server from "../../config/server";
import bot from "../../config/bot";
import users from "../../config/users";
import events from "../../config/events";

const prefix = bot.prefix;
const command = commands.basic.commands.guide;

const sendGuide = async (
  source: ChatInputCommandInteraction | Message,
  userId: string
): Promise<void> => {
  const guild = source.client.guilds.cache.get(server.id);
  if (!guild) {
    source.reply("Guild not found.");
    return;
  }

  const member = await guild.members.fetch(userId);
  if (!member) {
    source.reply("Member not found in the guild.");
    return;
  }

  let description = `👋 Hey! It's **${source.client.user.displayName}**!`;

  description += ` \n\n💰 You can earn ${currencies.coin.emoji} ${currencies.coin.name} by using certain commands or by chatting in <#${events.lootDrop.channelId}>.`;
  description += ` Use \`${prefix}help\` to see a list of all commands that you can use.`;

  description += ` \n\n📜 There are some rules that you need to follow while using the bot!`;
  description += ` Use \`${prefix}rules\` to see the rules that you need to follow while using the bot.`;
  description += ` If you break any of the rules, you will be warned or even banned from using the bot!`;

  description += ` \n\n💡 We are accpeting suggestions for the bot!`;
  description += ` If you have any suggestions, feel free to DM <@${users.owner.id}>.`;

  const guideEmbed = new EmbedBuilder()
    .setColor(colors.embed.status.info)
    .setTitle(`${command.emoji} Bot Guide`)
    .setDescription(description)
    .setFooter({
      text: `Use ${prefix}help [command] to see how to use a specific command.`,
    });

  await source.reply({
    embeds: [guideEmbed],
  });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction: ChatInputCommandInteraction) {
    await sendGuide(interaction, interaction.user.id);
  },

  async prefix(message: Message, _args: string[]) {
    await sendGuide(message, message.author.id);
  },
};
