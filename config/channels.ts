import { isDev } from "../config";

const defaultAllowedChannelId = isDev // bot-commands
  ? "1384146194304860325"
  : "1383090675137908879";

const channels = {
  allowedChannels: [defaultAllowedChannelId],
  defaultAllowedChannelId: defaultAllowedChannelId,
};

export default channels;
