import axios from "axios";
import config from "../config.js";

const pingUrl = process.env.URL + "/ping";
console.log(`🏓 Self Pinging started at ${pingUrl}`);

function selfPing(intervalMinutes) {
  return setInterval(async () => {
    try {
      await axios.get(pingUrl);
    } catch (error) {
      if (config.isProd) console.log("❌ Self Ping Failed:", error);
    }
  }, intervalMinutes * 60 * 1000);
}

export default selfPing;
