import { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import {
    doc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db, appId, COLLECTIONS } from '../lib/firebase';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const checkAvailability = async (field, value) => {
        const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
        const q = query(providersRef, where(field, "==", value));
        const snap = await getDocs(q);
        return snap.empty;
    };

    const register = async (email, password, profileData) => {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        // 2. Create Provider Profile
        const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
        const userDocRef = doc(providersRef, newUser.uid);

        const newProfile = {
            ...profileData,
            email,
            createdAt: serverTimestamp(),
            settings: { gapMinutes: 15, dayStart: "09:00", dayEnd: "17:00", currency: "$" },
            services: []
        };

        await setDoc(userDocRef, newProfile, { merge: true });
        return newUser;
    };

    return {
        user,
        loading,
        login,
        logout,
        register,
        checkAvailability
    };
}
