import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref as dbRef, set, onDisconnect, serverTimestamp as rtdbTimestamp } from "firebase/database";
import { auth, db, googleProvider, rtdb } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  username: string;
  bio?: string;
  createdAt: unknown;
  lastSeen: unknown;
  online: boolean;
  theme?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const setOnlineStatus = async (uid: string, online: boolean) => {
    if (!rtdb) return;
    const presenceRef = dbRef(rtdb, `presence/${uid}`);
    await set(presenceRef, { online, lastSeen: rtdbTimestamp() });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
        if (rtdb) {
          await setOnlineStatus(firebaseUser.uid, true);
          const presenceRef = dbRef(rtdb, `presence/${firebaseUser.uid}`);
          onDisconnect(presenceRef).set({ online: false, lastSeen: rtdbTimestamp() });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName });
    const username = displayName.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 9999);
    const userProfile: UserProfile = {
      uid: newUser.uid,
      displayName,
      email: newUser.email!,
      photoURL: null,
      username,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      online: true,
    };
    await setDoc(doc(db, "users", newUser.uid), userProfile);
    setProfile(userProfile);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const { user: googleUser } = result;
    const docRef = doc(db, "users", googleUser.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const username = (googleUser.displayName || "user").toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 9999);
      const userProfile: UserProfile = {
        uid: googleUser.uid,
        displayName: googleUser.displayName || "User",
        email: googleUser.email!,
        photoURL: googleUser.photoURL,
        username,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        online: true,
      };
      await setDoc(docRef, userProfile);
      setProfile(userProfile);
    } else {
      setProfile(docSnap.data() as UserProfile);
    }
  };

  const logout = async () => {
    if (user) await setOnlineStatus(user.uid, false);
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { ...data, lastSeen: serverTimestamp() }, { merge: true });
    setProfile((prev) => prev ? { ...prev, ...data } : null);
    if (data.displayName) {
      await updateProfile(user, { displayName: data.displayName });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signInWithGoogle, logout, resetPassword, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
