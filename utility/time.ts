export const parseTime = (
  str: string
): { success: boolean; duration: number | null } => {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };

  const regex = /(\d+)(\w+)/i;
  const match = str.match(regex);
  if (!match)
    return {
      success: false,
      duration: null,
    };

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multiplier = units[unit[0]];
  if (!multiplier)
    return {
      success: false,
      duration: null,
    };

  return {
    success: true,
    duration: value * multiplier,
  };
};
