import colors from "../config/colors";
import { CommandStatus } from "../types";
import { createEmbed } from "./embed";

const statusColors: Record<Exclude<CommandStatus, "enabled">, number> = {
  comingSoon: colors.embed.status.info,
  removed: colors.embed.status.error,
  disabled: colors.embed.status.error,
  temporarilyDisabled: colors.embed.status.warning,
};

const statusTitles: Record<Exclude<CommandStatus, "enabled">, string> = {
  comingSoon: "🚀 Coming Soon",
  removed: "🗑️ Command Removed",
  disabled: "🚫 Command Disabled",
  temporarilyDisabled: "🚧 Temporarily Disabled",
};

const statusDescriptions: Record<Exclude<CommandStatus, "enabled">, string> = {
  disabled: "This command is currently disabled.",
  temporarilyDisabled:
    "This command is temporarily disabled. Check back later.",
  removed: "This command has been removed and is no longer available.",
  comingSoon:
    "This command isn't available yet, but it's coming soon! Stay tuned. 🚀",
};

export function getStatusEmbed(status: Exclude<CommandStatus, "enabled">) {
  return createEmbed(
    statusColors[status],
    statusTitles[status],
    statusDescriptions[status],
    "Status Information"
  );
}
