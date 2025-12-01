import {
    doc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    FirestoreError
} from 'firebase/firestore';
import { db, appId, COLLECTIONS } from '../lib/firebase';

export interface Provider {
    id: string;
    businessName: string;
    businessUrl: string;
    email: string;
    settings?: {
        gapMinutes: number;
        dayStart: string;
        dayEnd: string;
        currency: string;
    };
    services?: any[];
    [key: string]: any;
}

export const providerService = {
    getProviderByUrl: async (url: string): Promise<Provider | null> => {
        const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
        const q = query(providersRef, where("businessUrl", "==", url));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const doc = snap.docs[0];
            return { id: doc.id, ...doc.data() } as Provider;
        }
        return null;
    },

    subscribeToProvider: (id: string, callback: (provider: Provider | null) => void, onError?: (error: FirestoreError) => void) => {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS, id);
        return onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                callback({ id: snap.id, ...snap.data() } as Provider);
            } else {
                callback(null);
            }
        }, onError);
    }
};
