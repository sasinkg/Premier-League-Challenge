import {
  writeBatch,
  collection,
  doc,
  getDocs,
  serverTimestamp,
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
  const prediction = {
    uid: user.uid,
    displayName: user.displayName ?? user.email ?? "Unknown",
    email: user.email ?? "",
    submittedAt: serverTimestamp(),
    teams,
    tiebreakers: tiebreakers ?? {},
  };

  // Keep the weekly entry as edit history, but also store the group's active
  // table separately so it stays visible until its owner submits an update.
  const batch = writeBatch(db);
  batch.set(
    doc(db, "groups", groupId, "predictions", weekKey, "users", user.uid),
    prediction,
    { merge: true },
  );
  batch.set(
    doc(db, "groups", groupId, "currentPredictions", user.uid),
    prediction,
    { merge: true },
  );
  await batch.commit();
}

export async function listPredictionsForWeek(
  groupId: string,
  weekKey: string,
): Promise<UserPrediction[]> {
  const snap = await getDocs(collection(db, "groups", groupId, "predictions", weekKey, "users"));
  return snap.docs.map((d) => d.data() as UserPrediction);
}

/**
 * Lists each member's active table. New submissions use currentPredictions;
 * the fallback keeps submissions made before that collection existed visible.
 */
export async function listActivePredictions(
  groupId: string,
  currentWeekKey: string,
): Promise<UserPrediction[]> {
  const currentSnap = await getDocs(
    collection(db, "groups", groupId, "currentPredictions"),
  );
  const active = new Map<string, UserPrediction>(
    currentSnap.docs.map((d) => [d.id, d.data() as UserPrediction]),
  );

  // Old submissions exist only in weekly subcollections. Query the known
  // weekly paths for the last year and use each user's newest entry.
  const oldWeeks = await Promise.all(
    recentWeekKeys(currentWeekKey, 52).map(async (weekKey) => ({
      weekKey,
      predictions: await listPredictionsForWeek(groupId, weekKey),
    })),
  );
  for (const { predictions } of oldWeeks) {
    for (const prediction of predictions) {
      if (!active.has(prediction.uid)) active.set(prediction.uid, prediction);
    }
  }

  return [...active.values()];
}

function recentWeekKeys(currentWeekKey: string, count: number): string[] {
  const current = new Date(`${currentWeekKey}T12:00:00`);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(current);
    date.setDate(date.getDate() - index * 7);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
}
