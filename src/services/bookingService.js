import {
    collection,
    addDoc,
    query,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db, appId, COLLECTIONS } from '../lib/firebase';

export const bookingService = {
    subscribeToAppointments: (providerId, callback, onError) => {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.APPOINTMENTS));
        return onSnapshot(q, (snap) => {
            const all = snap.docs.map(d => d.data());
            // Filter client-side for simplicity as per original code
            callback(all.filter(a => a.providerId === providerId));
        }, onError);
    },

    createBooking: async (bookingData) => {
        return addDoc(collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.APPOINTMENTS), {
            ...bookingData,
            status: 'confirmed',
            createdAt: serverTimestamp()
        });
    }
};
