import { isDev } from "../config";

const channels = {
  allowedChannels: [
    isDev ? "1384146194304860325" : "1383090675137908879", // bot
  ],
  defaultAllowedChannelId: isDev
    ? "1384146194304860325" // dev -> bot
    : "1383090675137908879", // prod -> bot
};

export default channels;
