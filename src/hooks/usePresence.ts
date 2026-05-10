import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export interface PresenceData {
  online: boolean;
  lastSeen: number | null;
}

export function usePresence(uid: string | null) {
  const [presence, setPresence] = useState<PresenceData>({ online: false, lastSeen: null });

  useEffect(() => {
    if (!uid || !rtdb) return;
    const presenceRef = ref(rtdb, `presence/${uid}`);
    const unsub = onValue(presenceRef, (snap) => {
      const data = snap.val();
      if (data) {
        setPresence({ online: data.online, lastSeen: data.lastSeen });
      }
    });
    return () => unsub();
  }, [uid]);

  return presence;
}

export function useMultiPresence(uids: string[]) {
  const [presences, setPresences] = useState<Record<string, PresenceData>>({});

  useEffect(() => {
    if (!uids.length || !rtdb) return;
    const db = rtdb;
    const unsubs = uids.map((uid) => {
      const presenceRef = ref(db, `presence/${uid}`);
      return onValue(presenceRef, (snap) => {
        const data = snap.val();
        setPresences((prev) => ({
          ...prev,
          [uid]: data ? { online: data.online, lastSeen: data.lastSeen } : { online: false, lastSeen: null },
        }));
      });
    });
    return () => unsubs.forEach((u) => u());
  }, [uids.join(",")]);

  return presences;
}
