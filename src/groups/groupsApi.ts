import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase";

/* =====================
   Public types
===================== */

export type GroupSummary = {
  id: string;
  name: string;
  code: string;
  deleted?: boolean;
};

/* =====================
   Internal Firestore shapes
===================== */

type GroupDoc = {
  name?: string;
  code?: string;
  ownerUid?: string;
  createdAt?: unknown;
};

type UserGroupIndexDoc = {
  groupId?: string;
  name?: string;
  code?: string;
  joinedAt?: unknown;
  deleted?: boolean;
};

/* =====================
   Helpers
===================== */

function makeCode(length = 4): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += Math.floor(Math.random() * 10).toString();
  }
  return s;
}

async function codeExists(code: string): Promise<boolean> {
  const q = query(
    collection(db, "groups"),
    where("code", "==", code),
    limit(1),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

/* =====================
   API
===================== */

export async function createGroup(
  user: User,
  nameRaw: string,
): Promise<GroupSummary> {
  const name = nameRaw.trim();
  if (!name) throw new Error("Group name is required");

  // retry a few times in case of collision
  let code = makeCode(4);
  for (let i = 0; i < 5; i++) {
    const exists = await codeExists(code);
    if (!exists) break;
    code = makeCode(4);
    if (i === 4) {
      throw new Error("Could not generate a unique group code. Try again.");
    }
  }

  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    code,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
    deleted: false,
  });

  // membership record
  await setDoc(
    doc(db, "groups", groupRef.id, "members", user.uid),
    {
      role: "owner",
      email: user.email ?? "",
      displayName: user.displayName ?? user.email ?? "Unknown",
      joinedAt: serverTimestamp(),
      deleted: false,
    },
    { merge: true },
  );

  // user → groups index
  await setDoc(
    doc(db, "users", user.uid, "groups", groupRef.id),
    {
      groupId: groupRef.id,
      name,
      code,
      joinedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { id: groupRef.id, name, code };
}

export async function joinGroupByCode(
  user: User,
  codeRaw: string,
): Promise<GroupSummary> {
  const code = codeRaw.trim();
  if (!code) throw new Error("Group code is required");

  const q = query(
    collection(db, "groups"),
    where("code", "==", code),
    limit(1),
  );

  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No group found with that code");

  const groupDocSnap = snap.docs[0];
  const data = groupDocSnap.data() as GroupDoc;

  const name =
    typeof data.name === "string" && data.name.length > 0
      ? data.name
      : "Untitled";

  await setDoc(
    doc(db, "groups", groupDocSnap.id, "members", user.uid),
    {
      role: "member",
      email: user.email ?? "",
      displayName: user.displayName ?? user.email ?? "Unknown",
      joinedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    doc(db, "users", user.uid, "groups", groupDocSnap.id),
    {
      groupId: groupDocSnap.id,
      name,
      code,
      joinedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { id: groupDocSnap.id, name, code };
}
export async function softDeleteGroup(user: User, groupId: string) {
  await updateDoc(doc(db, "groups", groupId), { deleted: true });
  await updateDoc(doc(db, "users", user.uid, "groups", groupId), {
    deleted: true,
  });
}

export async function listMyGroups(user: User): Promise<GroupSummary[]> {
  const snap = await getDocs(collection(db, "users", user.uid, "groups"));

  return snap.docs
    .map((d) => {
      const data = d.data() as UserGroupIndexDoc;
      return {
        id: d.id,
        name:
          typeof data.name === "string" && data.name.length > 0
            ? data.name
            : "Untitled",
        code: typeof data.code === "string" ? data.code : "",
        deleted: data.deleted === true,
      };
    })
    .filter((g) => g.deleted !== true)
    .sort((a, b) => a.name.localeCompare(b.name));
}
