import { users } from "./db";
import type { QuerySnapshot, DocumentData } from "firebase-admin/firestore";

export type LeaderboardEntry = {
  userId: string;
  balance: number;
};

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const q: QuerySnapshot<DocumentData> = await users
    .orderBy("balance", "desc")
    .limit(limit)
    .get();
  return q.docs.map((doc) => ({
    userId: doc.id,
    balance: doc.data().balance as number,
  }));
}

export default {
  getLeaderboard,
};
