const { users } = require("../db");

async function getLeaderboard(limit = 10) {
  const q = await users.orderBy("balance", "desc").limit(limit).get();
  return q.docs.map((doc) => ({ userId: doc.id, balance: doc.data().balance }));
}

export default {
  getLeaderboard,
};
