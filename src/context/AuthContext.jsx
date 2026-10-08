import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseMocked } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseMocked) {
      const savedUser = localStorage.getItem('mock_user');
      const parsed = savedUser ? JSON.parse(savedUser) : {
        uid: "mock-user-123",
        email: "demo@synapse.io",
        displayName: "Demo User",
        emailVerified: true
      };
      setUser(parsed);
      setSession(parsed ? { user: parsed } : null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Mock session object to maintain compatibility with Supabase-style session usage
      setSession(currentUser ? { user: currentUser } : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    if (isFirebaseMocked) {
      const mockUser = {
        uid: `mock-user-${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        displayName: fullName,
        emailVerified: true
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ user: mockUser });
      return { user: mockUser };
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the Firebase user's display name
    await updateProfile(user, { displayName: fullName });
    
    // Trigger the actual email verification!
    await sendEmailVerification(user);
    
    return userCredential;
  };

  const signIn = async (email, password) => {
    if (isFirebaseMocked) {
      const mockUser = {
        uid: "mock-user-123",
        email: email,
        displayName: email.split('@')[0],
        emailVerified: true
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setSession({ user: mockUser });
      return { user: mockUser };
    }
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    if (isFirebaseMocked) {
      localStorage.removeItem('mock_user');
      setUser(null);
      setSession(null);
      return;
    }
    return await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

