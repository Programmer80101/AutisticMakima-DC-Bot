import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Message,
  User,
  EmbedBuilder,
} from "discord.js";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

import { getLastDaily, setLastDaily } from "../../firebase/daily";
import { modifyBalance } from "../../firebase/balance";
import { getRandomTip } from "../../utility/random";
import commandConfig from "../../config/commands";
import colors from "../../config/colors";
import emojis from "../../config/emojis";

dayjs.extend(relativeTime);

const command = commandConfig.economy.commands.daily;

const COOLDOWN_HOURS = 23;
const DAILY_AMOUNT = 10;

const getDaily = async (
  source: ChatInputCommandInteraction | Message,
  user: User
): Promise<void> => {
  const now = dayjs();
  const lastClaimIso = await getLastDaily(user.id);

  if (lastClaimIso) {
    const lastClaim = dayjs(lastClaimIso);
    const hoursSince = now.diff(lastClaim, "hour", true);

    if (hoursSince < COOLDOWN_HOURS) {
      const next = lastClaim.add(COOLDOWN_HOURS, "hour");
      const inTime = next.fromNow(true);

      const dailyEmbed = new EmbedBuilder()
        .setColor(colors.embed.neutral)
        .setTitle("💸 Daily Already Claimed")
        .setDescription(
          `You have already claimed your daily reward! Come back in ${inTime}.`
        )
        .setFooter({
          text: getRandomTip(commandConfig.economy.name, command.name),
        });

      await source.reply({
        embeds: [dailyEmbed],
      });

      return;
    }
  }

  await modifyBalance(user.id, DAILY_AMOUNT);
  await setLastDaily(user.id, Date.now());

  const dailyEmbed = new EmbedBuilder()
    .setColor(colors.embed.gold)
    .setTitle("💸 Daily Reward")
    .setDescription(
      `You claimed ${emojis.currency.coin} ${DAILY_AMOUNT} coins!\nCome back again tomorrow to claim more coins!`
    )
    .setFooter({
      text: getRandomTip(commandConfig.economy.name, command.name),
    });

  await source.reply({ embeds: [dailyEmbed] });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    await getDaily(interaction, user);
  },

  async prefix(message: Message) {
    const user = message.author;
    await getDaily(message, user);
  },
};
