import { isDev } from "../config";

const defaultAllowedChannelId = isDev // bot-commands
  ? "1384146194304860325"
  : "1383090675137908879";

const channels = {
  allowedChannels: [
    "1383090758135058523", // staff commands
    defaultAllowedChannelId,
  ],
  defaultAllowedChannelId: defaultAllowedChannelId,
};

export default channels;
