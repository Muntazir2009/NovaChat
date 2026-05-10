import { useState, useCallback, useEffect, useRef } from "react";
import { ref, set, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export function useTyping(chatId: string | null) {
  const { user } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!chatId || !user || !rtdb) return;
    const typingRef = ref(rtdb, `typing/${chatId}/${user.uid}`);
    set(typingRef, isTyping ? { typing: true, timestamp: Date.now() } : null);
  }, [chatId, user]);

  const handleTyping = useCallback(() => {
    setTyping(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTyping(false), 3000);
  }, [setTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTyping(false);
    };
  }, [chatId, setTyping]);

  return { handleTyping, setTyping };
}

export function useTypingIndicator(chatId: string | null) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!chatId || !rtdb) return;
    const db = rtdb;
    const typingRef = ref(db, `typing/${chatId}`);
    const unsub = onValue(typingRef, (snap) => {
      const data = snap.val() || {};
      const filtered: Record<string, boolean> = {};
      for (const [uid, val] of Object.entries(data)) {
        if (uid !== user?.uid && (val as { typing: boolean }).typing) {
          filtered[uid] = true;
        }
      }
      setTypingUsers(filtered);
    });
    return () => unsub();
  }, [chatId, user?.uid]);

  return typingUsers;
}
