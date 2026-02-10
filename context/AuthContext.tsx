import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Fetch user profile from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUserProfile(userDoc.data() as UserProfile);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email: string, password: string, displayName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update display name
        await updateProfile(firebaseUser, { displayName });

        // Create user profile in Firestore
        const userProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName,
            photoURL: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...userProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        setUserProfile(userProfile);
    };

    const logout = async () => {
        await signOut(auth);
        setUserProfile(null);
    };

    const updateUserProfile = async (data: Partial<UserProfile>) => {
        if (!user) return;

        await setDoc(
            doc(db, 'users', user.uid),
            { ...data, updatedAt: serverTimestamp() },
            { merge: true }
        );

        setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userProfile,
                loading,
                login,
                register,
                logout,
                updateUserProfile,
            }}
        >
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
