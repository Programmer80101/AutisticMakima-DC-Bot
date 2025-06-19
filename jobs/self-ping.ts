import axios from "axios";
import { isProd } from "../config";

const pingUrl = `${process.env.URL}/ping`;
console.log(`🏓 Self Pinging started at ${pingUrl}`);

export default function selfPing(intervalMinutes: number): NodeJS.Timeout {
  return setInterval(async () => {
    try {
      await axios.get(pingUrl);
    } catch (error) {
      if (isProd) console.error("❌ Self Ping Failed:", error);
    }
  }, intervalMinutes * 60_000);
}
