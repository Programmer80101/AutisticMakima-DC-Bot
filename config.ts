import path from "path";
import dotenv from "dotenv";

import { capitalizeFirstLetter } from "./utility/string";

const envMode = process.env.NODE_ENV?.trim() ?? "production";
const envFile = path.resolve(import.meta.dirname, `.env.${envMode}`);

dotenv.config({ path: envFile });

console.log(`🔒 Environment Mode: ${capitalizeFirstLetter(envMode)}`);

if (envMode != "development") {
  console.log(`⚠️ Alert: You are not in development mode!`);
}

export const isDev = envMode === "development";
export const isProd = !isDev;

// mod: {
//   somethingWentWrong: "⚠️ Something went wrong",
//   selfSabotage: "🔰 Self Sabotage",
//   roleHierarchy: "📊 Improper Role Heirarchy",
//   insufficientPermissions: "⛔ Insufficient Permissions",
//   invalidArguments: "❌ Invalid Arguments",
//   invalidDuration: "⏱️ Invalid Duration",
// },
