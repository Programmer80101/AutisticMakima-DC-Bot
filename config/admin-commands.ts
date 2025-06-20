import debug from "./admin-commands/debug";
import economy from "./admin-commands/economy";

const adminCommands = {
  ...debug,
  ...economy,
};

export default adminCommands;
