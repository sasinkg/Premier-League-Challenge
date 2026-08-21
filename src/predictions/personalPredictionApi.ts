import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase";
import type { TeamInfo } from "../api/premierLeague";

export type PersonalPrediction = {
  teams: TeamInfo[];
  updatedAt?: Timestamp;
};

const predictionRef = (uid: string) =>
  doc(db, "users", uid, "settings", "prediction");

export async function loadMyPersonalPrediction(
  user: User,
): Promise<PersonalPrediction | null> {
  const snapshot = await getDoc(predictionRef(user.uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data() as Partial<PersonalPrediction>;
  if (!Array.isArray(data.teams)) return null;
  const teams = data.teams.filter(
    (team): team is TeamInfo =>
      typeof team?.name === "string" && typeof team?.logo === "string",
  );
  return teams.length ? { teams, updatedAt: data.updatedAt } : null;
}

export async function saveMyPersonalPrediction(
  user: User,
  teams: TeamInfo[],
): Promise<void> {
  await setDoc(
    predictionRef(user.uid),
    { teams, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
