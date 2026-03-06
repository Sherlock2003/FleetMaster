import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail,
  confirmPasswordReset
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmReset: (oobCode: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error('Firebase auth is not initialized. Check your environment variables.');
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email: string, password: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    return signInWithEmailAndPassword(auth, email, password).then(() => {});
  };

  const register = (email: string, password: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    return createUserWithEmailAndPassword(auth, email, password).then(() => {});
  };

  const loginWithGoogle = () => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider).then(() => {});
  };

  const logout = () => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    return sendPasswordResetEmail(auth, email);
  };

  const confirmReset = (oobCode: string, newPassword: string) => {
    if (!auth) throw new Error('Firebase auth is not initialized');
    return confirmPasswordReset(auth, oobCode, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, resetPassword, confirmReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
