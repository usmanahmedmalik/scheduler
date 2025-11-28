import {
    doc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot
} from 'firebase/firestore';
import { db, appId, COLLECTIONS } from '../lib/firebase';

export const providerService = {
    getProviderByUrl: async (url) => {
        const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
        const q = query(providersRef, where("businessUrl", "==", url));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const doc = snap.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    },

    subscribeToProvider: (id, callback, onError) => {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS, id);
        return onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                callback({ id: snap.id, ...snap.data() });
            } else {
                callback(null);
            }
        }, onError);
    }
};
