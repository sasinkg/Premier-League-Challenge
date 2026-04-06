import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase";
import type { TeamInfo } from "../api/premierLeague";

export type Tiebreakers = {
  topScorer?: string;
  topAssister?: string;
};

export type UserPrediction = {
  uid: string;
  displayName: string;
  email: string;
  submittedAt?: Timestamp;
  teams: TeamInfo[];
  tiebreakers?: Tiebreakers;
};

export async function saveMyPrediction(
  user: User,
  groupId: string,
  weekKey: string,
  teams: TeamInfo[],
  tiebreakers?: Tiebreakers,
): Promise<void> {
  await setDoc(
    doc(db, "groups", groupId, "predictions", weekKey, "users", user.uid),
    {
      uid: user.uid,
      displayName: user.displayName ?? user.email ?? "Unknown",
      email: user.email ?? "",
      submittedAt: serverTimestamp(),
      teams,
      tiebreakers: tiebreakers ?? {},
    },
    { merge: true },
  );
}

export async function listPredictionsForWeek(
  groupId: string,
  weekKey: string,
): Promise<UserPrediction[]> {
  const snap = await getDocs(collection(db, "groups", groupId, "predictions", weekKey, "users"));
  return snap.docs.map((d) => d.data() as UserPrediction);
}
