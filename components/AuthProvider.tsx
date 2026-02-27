'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

type Role = 'admin' | 'staff' | 'user';

type ProfileData = {
  displayName: string;
  role: Role;
};

type AuthContextValue = {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const defaultProfile = {
  displayName: '',
  role: 'user' as Role,
};

const SEED_ADMIN_EMAIL = 'admin@admin.com';

const isSeedAdmin = (email: string | null | undefined) =>
  (email ?? '').trim().toLowerCase() === SEED_ADMIN_EMAIL;

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      setProfile(null);
      return;
    }

    const userRef = doc(db, 'admin_users', auth.currentUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<ProfileData>;
      const nextRole: Role = isSeedAdmin(auth.currentUser.email)
        ? 'admin'
        : ((data.role as Role) ?? 'user');

      if (data.role !== nextRole) {
        await setDoc(
          userRef,
          {
            role: nextRole,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      setProfile({
        displayName: data.displayName ?? auth.currentUser.displayName ?? auth.currentUser.email ?? '',
        role: nextRole,
      });
      return;
    }

    const fallbackProfile: ProfileData = {
      ...defaultProfile,
      displayName: auth.currentUser.displayName ?? auth.currentUser.email ?? '',
      role: isSeedAdmin(auth.currentUser.email) ? 'admin' : 'user',
    };

    await setDoc(userRef, {
      ...fallbackProfile,
      email: auth.currentUser.email ?? '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setProfile(fallbackProfile);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await setPersistence(auth, browserLocalPersistence);

      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;

        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            await refreshProfile();
          } catch {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    };

    let unsubscribe: (() => void) | undefined;
    void init().then((fn) => {
      unsubscribe = fn;
    });

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    await refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user.');
    }
    await updatePassword(auth.currentUser, newPassword);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    login,
    logout,
    refreshProfile,
    changePassword,
  }), [user, profile, loading, login, logout, refreshProfile, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAppAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAppAuth must be used within AppAuthProvider');
  }
  return context;
}
