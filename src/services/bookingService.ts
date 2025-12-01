import {
    collection,
    addDoc,
    query,
    onSnapshot,
    serverTimestamp,
    FirestoreError,
    DocumentReference
} from 'firebase/firestore';
import { db, appId, COLLECTIONS } from '../lib/firebase';

export interface Booking {
    id?: string;
    providerId: string;
    serviceId: string;
    date: string;
    time: string;
    clientName: string;
    clientEmail: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    createdAt?: any;
    [key: string]: any;
}

export const bookingService = {
    subscribeToAppointments: (providerId: string, callback: (bookings: Booking[]) => void, onError?: (error: FirestoreError) => void) => {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.APPOINTMENTS));
        return onSnapshot(q, (snap) => {
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
            // Filter client-side for simplicity as per original code
            callback(all.filter(a => a.providerId === providerId));
        }, onError);
    },

    createBooking: async (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<DocumentReference> => {
        return addDoc(collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.APPOINTMENTS), {
            ...bookingData,
            status: 'confirmed',
            createdAt: serverTimestamp()
        });
    }
};
