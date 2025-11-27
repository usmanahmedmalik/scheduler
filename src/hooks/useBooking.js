import { useState, useMemo, useEffect } from 'react';
import {
    collection,
    addDoc,
    query,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db, appId, COLLECTIONS } from '../lib/firebase';

export function useBooking(providerId, service, selectedDate, providerSettings) {
    const [existingAppts, setExistingAppts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch existing appointments
    useEffect(() => {
        if (!providerId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.APPOINTMENTS));
        const unsubscribe = onSnapshot(q, (snap) => {
            const all = snap.docs.map(d => d.data());
            setExistingAppts(all.filter(a => a.providerId === providerId));
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [providerId]);

    // Calculate slots
    const timeSlots = useMemo(() => {
        if (!service || !selectedDate || !providerSettings) return [];

        const { dayStart = "09:00", dayEnd = "17:00", gapMinutes = 15 } = providerSettings;
        const duration = service.duration;
        const slots = [];
        let current = new Date(`${selectedDate}T${dayStart}`);
        const end = new Date(`${selectedDate}T${dayEnd}`);

        while (current < end) {
            const timeString = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const isBlocked = existingAppts.some(appt => appt.date === selectedDate && appt.time === timeString);
            if (!isBlocked) slots.push(timeString);
            current.setMinutes(current.getMinutes() + duration + gapMinutes);
        }
        return slots;
    }, [service, selectedDate, existingAppts, providerSettings]);

    const submitBooking = async (bookingData) => {
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.APPOINTMENTS), {
                ...bookingData,
                providerId,
                status: 'confirmed',
                createdAt: serverTimestamp()
            });
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return { existingAppts, timeSlots, submitBooking, loading, error };
}
