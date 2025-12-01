import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User,
    UserCredential
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

export interface UserProfile {
    businessName: string;
    businessUrl: string;
    email: string;
    subscription: string;
    [key: string]: any;
}

export const authService = {
    subscribeToAuth: (callback: (user: User | null) => void) => {
        return onAuthStateChanged(auth, callback);
    },

    login: (email: string, password: string): Promise<UserCredential> => {
        return signInWithEmailAndPassword(auth, email, password);
    },

    logout: (): Promise<void> => {
        return signOut(auth);
    },

    checkAvailability: async (field: string, value: string): Promise<boolean> => {
        const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
        const q = query(providersRef, where(field, "==", value));
        const snap = await getDocs(q);
        return snap.empty;
    },

    register: async (email: string, password: string, profileData: UserProfile): Promise<User> => {
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
    }
};
