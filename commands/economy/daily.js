import { SlashCommandBuilder } from "discord.js";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

import { getLastDaily, setLastDaily } from "../../utils/daily.js";
import { addBalance } from "../../utils/balance.js";
import { getRandomTip } from "../../utils.js";
import commandConfig from "../../commands.js";
import config from "../../config.js";

dayjs.extend(relativeTime);

const command = commandConfig.economy.commands.daily;
const COOLDOWN_HOURS = config.economy.daily.cooldownHours;
const DAILY_AMOUNT = config.economy.daily.amount;

const getDaily = async (source, user) => {
  const now = dayjs();
  const lastClaimIso = await getLastDaily(user.id);

  if (lastClaimIso) {
    const lastClaim = dayjs(lastClaimIso);
    const hoursSince = now.diff(lastClaim, "hour", true);

    if (hoursSince < COOLDOWN_HOURS) {
      const next = lastClaim.add(COOLDOWN_HOURS, "hour");
      const inTime = next.fromNow(true);

      const dailyEmbed = {
        title: "💸 Daily Already Claimed",
        color: config.embed.color.red,
        description: `
          You have already claimed your daily reward! Come back in ${inTime}.
        `,
        footer: {
          text: getRandomTip(commandConfig.economy.name, command.name),
        },
      };

      return await source.reply({
        embeds: [dailyEmbed],
      });
    }
  }

  await addBalance(user.id, DAILY_AMOUNT);
  await setLastDaily(user.id, Date.now());

  const dailyEmbed = {
    title: "💸 Daily Reward",
    color: config.embed.color.green,
    description: `
      You claimed ${config.emoji.general.currency} ${DAILY_AMOUNT} coins!
      \nCome back again tomorrow to claim more coins!
    `,
    footer: {
      text: getRandomTip(commandConfig.economy.name, command.name),
    },
  };

  await source.reply({ embeds: [dailyEmbed] });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction) {
    const user = interaction.user;
    await getDaily(interaction, user);
  },

  async prefix(message) {
    const user = message.author;
    await getDaily(message, user);
  },
};
