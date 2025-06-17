import { SlashCommandBuilder } from "discord.js";

import commandConfig from "../../commands.js";
import config from "../../config.js";

const command = commandConfig.basic.commands.guide;

function joinedBefore(member, cutoffDate) {
  return member.joinedTimestamp < cutoffDate.getTime();
}

const sendGuide = async (source, userId) => {
  const guild = source.client.guilds.cache.get(config.server.id);
  if (!guild) {
    return source.reply("Guild not found.");
  }

  const member = await guild.members.fetch(userId);
  if (!member) {
    return source.reply("Member not found in the guild.");
  }

  let description = `👋 Hey! It's **${config.name}**!`;

  const cutoffDate = new Date("2025-5-22");
  if (joinedBefore(member, cutoffDate)) {
    description += ` \n\n🔄️ I will be replacing the bot Mimu and will be the new currency bot for the server.`;
    description += ` All of your ${config.emoji.general.currency} WRLD Coins will be transferred over to me automatically!`;
  }

  description += ` \n\n💰 You can earn ${config.emoji.general.currency} WRLD Coins by using certain commands or by chatting in <#${config.economy.coinDrop.channelId}>.`;
  description += ` Use \`${config.prefix}help\` to see a list of all commands that you can use.`;

  description += ` \n\n📜 There are some rules that you need to follow while using the bot!`;
  description += ` Use \`${config.prefix}rules\` to see the rules that you need to follow while using the bot.`;
  description += ` If you break any of the rules, you will be warned or even banned from using the bot!`;

  description += ` \n\n💡 We are accpeting suggestions for the bot!`;
  description += ` If you have any suggestions, feel free to DM <@${config.owner.id}> or contact staff members.`;

  const guideEmbed = {
    color: config.embed.color.default,
    title: `${command.emoji} Bot Guide`,
    description: description,
    footer: {
      text: `Use ${config.prefix}help [command] to see how to use a specific command.`,
    },
  };

  await source.reply({
    embeds: [guideEmbed],
  });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction) {
    await sendGuide(interaction, interaction.user.id);
  },

  async prefix(message, args) {
    await sendGuide(message, message.author.id);
  },
};
