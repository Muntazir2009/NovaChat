import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  getDocs,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export interface Chat {
  id: string;
  type: "direct" | "group";
  name?: string;
  photoURL?: string;
  members: string[];
  admins?: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: unknown;
    type?: string;
  };
  createdAt: unknown;
  updatedAt: unknown;
  description?: string;
  pinnedMessage?: string;
  unreadCounts?: Record<string, number>;
  typing?: Record<string, boolean>;
  theme?: string;
  wallpaper?: string;
}

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chat)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const createDirectChat = useCallback(async (otherUid: string) => {
    if (!user) return null;
    const existing = chats.find(
      (c) => c.type === "direct" && c.members.includes(otherUid) && c.members.includes(user.uid)
    );
    if (existing) return existing.id;
    const ref = await addDoc(collection(db, "chats"), {
      type: "direct",
      members: [user.uid, otherUid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCounts: { [user.uid]: 0, [otherUid]: 0 },
    });
    return ref.id;
  }, [user, chats]);

  const createGroupChat = useCallback(async (name: string, memberUids: string[], photoURL?: string) => {
    if (!user) return null;
    const allMembers = [...new Set([user.uid, ...memberUids])];
    const unreadCounts: Record<string, number> = {};
    allMembers.forEach((uid) => (unreadCounts[uid] = 0));
    const ref = await addDoc(collection(db, "chats"), {
      type: "group",
      name,
      photoURL: photoURL || null,
      members: allMembers,
      admins: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      unreadCounts,
    });
    return ref.id;
  }, [user]);

  const updateGroupChat = useCallback(async (chatId: string, data: Partial<Chat>) => {
    await updateDoc(doc(db, "chats", chatId), { ...data, updatedAt: serverTimestamp() });
  }, []);

  const deleteGroupChat = useCallback(async (chatId: string) => {
    await deleteDoc(doc(db, "chats", chatId));
  }, []);

  const addMember = useCallback(async (chatId: string, uid: string) => {
    await updateDoc(doc(db, "chats", chatId), {
      members: arrayUnion(uid),
      [`unreadCounts.${uid}`]: 0,
    });
  }, []);

  const removeMember = useCallback(async (chatId: string, uid: string) => {
    await updateDoc(doc(db, "chats", chatId), {
      members: arrayRemove(uid),
    });
  }, []);

  const markAsRead = useCallback(async (chatId: string) => {
    if (!user) return;
    await updateDoc(doc(db, "chats", chatId), {
      [`unreadCounts.${user.uid}`]: 0,
    });
  }, [user]);

  const getChatById = useCallback(async (chatId: string): Promise<Chat | null> => {
    const snap = await getDoc(doc(db, "chats", chatId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Chat;
  }, []);

  return {
    chats,
    loading,
    createDirectChat,
    createGroupChat,
    updateGroupChat,
    deleteGroupChat,
    addMember,
    removeMember,
    markAsRead,
    getChatById,
  };
}
