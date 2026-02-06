import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase";

export type GroupSummary = {
  id: string;
  name: string;
  code: string;
};

function makeCode(length = 4): string {
  let s = "";
  for (let i = 0; i < length; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}

async function codeExists(code: string): Promise<boolean> {
  const q = query(collection(db, "groups"), where("code", "==", code), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function createGroup(user: User, nameRaw: string): Promise<GroupSummary> {
  const name = nameRaw.trim();
  if (!name) throw new Error("Group name is required");

  // retry a few times in case of code collision
  let code = makeCode(4);
  for (let i = 0; i < 5; i++) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await codeExists(code);
    if (!exists) break;
    code = makeCode(4);
    if (i === 4) throw new Error("Could not generate a unique group code. Try again.");
  }

  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    code,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
  });

  // membership record
  await setDoc(doc(db, "groups", groupRef.id, "members", user.uid), {
    role: "owner",
    email: user.email ?? "",
    displayName: user.displayName ?? user.email ?? "Unknown",
    joinedAt: serverTimestamp(),
  });

  // user -> groups index for fast listing
  await setDoc(doc(db, "users", user.uid, "groups", groupRef.id), {
    groupId: groupRef.id,
    name,
    code,
    joinedAt: serverTimestamp(),
  });

  return { id: groupRef.id, name, code };
}

export async function joinGroupByCode(user: User, codeRaw: string): Promise<GroupSummary> {
  const code = codeRaw.trim();
  if (!code) throw new Error("Group code is required");

  const q = query(collection(db, "groups"), where("code", "==", code), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No group found with that code");

  const groupDoc = snap.docs[0];
  const data = groupDoc.data();

  const name = String(data.name ?? "Untitled");

  await setDoc(doc(db, "groups", groupDoc.id, "members", user.uid), {
    role: "member",
    email: user.email ?? "",
    displayName: user.displayName ?? user.email ?? "Unknown",
    joinedAt: serverTimestamp(),
  });

  await setDoc(doc(db, "users", user.uid, "groups", groupDoc.id), {
    groupId: groupDoc.id,
    name,
    code,
    joinedAt: serverTimestamp(),
  });

  return { id: groupDoc.id, name, code };
}

export async function listMyGroups(user: User): Promise<GroupSummary[]> {
  const snap = await getDocs(collection(db, "users", user.uid, "groups"));
  return snap.docs
    .map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        name: String(data.name ?? "Untitled"),
        code: String(data.code ?? ""),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
