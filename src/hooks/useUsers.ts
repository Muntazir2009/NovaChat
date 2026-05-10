import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/contexts/AuthContext";

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (searchTerm: string): Promise<UserProfile[]> => {
    if (!searchTerm.trim()) return [];
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("displayName", ">=", searchTerm),
        where("displayName", "<=", searchTerm + "\uf8ff"),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as UserProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (uid: string): Promise<UserProfile | null> => {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  }, []);

  const getUsersByIds = useCallback(async (uids: string[]): Promise<UserProfile[]> => {
    if (!uids.length) return [];
    const promises = uids.map((uid) => getDoc(doc(db, "users", uid)));
    const snaps = await Promise.all(promises);
    return snaps
      .filter((s) => s.exists())
      .map((s) => s.data() as UserProfile);
  }, []);

  return { users, loading, searchUsers, getUserById, getUsersByIds };
}

export function useUserProfile(uid: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { profile, loading };
}
