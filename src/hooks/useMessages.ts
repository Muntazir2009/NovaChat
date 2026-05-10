import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  limit,
  startAfter,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  timestamp: unknown;
  type: "text" | "system";
  reactions?: Record<string, Reaction>;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  edited?: boolean;
  editedAt?: unknown;
  deleted?: boolean;
  readBy?: string[];
  deliveredTo?: string[];
  pinned?: boolean;
}

const PAGE_SIZE = 30;

export function useMessages(chatId: string | null) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<unknown>(null);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setMessages([]);
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
      limit(PAGE_SIZE)
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
      if (snap.docs.length > 0) {
        lastDocRef.current = snap.docs[snap.docs.length - 1];
      }
      setHasMore(snap.docs.length === PAGE_SIZE);
      setLoading(false);
    });
    return unsub;
  }, [chatId]);

  const loadMore = useCallback(async () => {
    if (!chatId || !lastDocRef.current || !hasMore) return;
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
      startAfter(lastDocRef.current),
      limit(PAGE_SIZE)
    );
    const snap = await getDocs(q);
    const older = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
    setMessages((prev) => [...older, ...prev]);
    if (snap.docs.length > 0) lastDocRef.current = snap.docs[snap.docs.length - 1];
    setHasMore(snap.docs.length === PAGE_SIZE);
  }, [chatId, hasMore]);

  const sendMessage = useCallback(async (
    text: string,
    type: Message["type"] = "text",
    extra?: Partial<Message>
  ) => {
    if (!chatId || !user || !profile) return;
    const msg: Omit<Message, "id"> = {
      text,
      senderId: user.uid,
      senderName: profile.displayName,
      senderPhoto: profile.photoURL || user.photoURL,
      timestamp: serverTimestamp(),
      type,
      readBy: [user.uid],
      deliveredTo: [user.uid],
      ...extra,
    };
    await addDoc(collection(db, "chats", chatId, "messages"), msg);
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: {
        text,
        senderId: user.uid,
        timestamp: serverTimestamp(),
        type,
      },
      updatedAt: serverTimestamp(),
    });
  }, [chatId, user, profile]);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!chatId) return;
    await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
      text: newText,
      edited: true,
      editedAt: serverTimestamp(),
    });
  }, [chatId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!chatId) return;
    await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
      deleted: true,
      text: "This message was deleted",
    });
  }, [chatId]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!chatId || !user) return;
    const msgRef = doc(db, "chats", chatId, "messages", messageId);
    const msgSnap = await getDoc(msgRef);
    if (!msgSnap.exists()) return;
    const data = msgSnap.data() as Message;
    const reactions = data.reactions || {};
    const existing = reactions[emoji];
    if (existing?.users.includes(user.uid)) {
      const updated = existing.users.filter((u) => u !== user.uid);
      if (updated.length === 0) {
        const { [emoji]: _, ...rest } = reactions;
        await updateDoc(msgRef, { reactions: rest });
      } else {
        await updateDoc(msgRef, { [`reactions.${emoji}`]: { emoji, users: updated } });
      }
    } else {
      await updateDoc(msgRef, {
        [`reactions.${emoji}`]: { emoji, users: [...(existing?.users || []), user.uid] },
      });
    }
  }, [chatId, user]);

  const pinMessage = useCallback(async (messageId: string, pin: boolean) => {
    if (!chatId) return;
    await updateDoc(doc(db, "chats", chatId, "messages", messageId), { pinned: pin });
    await updateDoc(doc(db, "chats", chatId), { pinnedMessage: pin ? messageId : null });
  }, [chatId]);

  const markRead = useCallback(async (messageId: string) => {
    if (!chatId || !user) return;
    await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
      readBy: [user.uid],
    });
  }, [chatId, user]);

  return {
    messages,
    loading,
    hasMore,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    pinMessage,
    markRead,
  };
}
