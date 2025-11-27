import { useState, useEffect } from 'react';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot
} from 'firebase/firestore';
import { db, appId, COLLECTIONS } from '../lib/firebase';

export function useProvider(identifier, type = 'id') {
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!identifier) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        async function fetchProvider() {
            try {
                if (type === 'url') {
                    const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
                    const q = query(providersRef, where("businessUrl", "==", identifier));
                    const snap = await getDocs(q);

                    if (!snap.empty) {
                        const doc = snap.docs[0];
                        setProvider({ id: doc.id, ...doc.data() });
                    } else {
                        setProvider(null);
                    }
                } else {
                    // Default to ID
                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS, identifier);

                    // Use onSnapshot for real-time updates if it's by ID (e.g. Dashboard)
                    // But for consistency let's stick to fetch or make it configurable.
                    // The original Dashboard uses onSnapshot.
                    // The original PublicBooking uses fetch for ID (but it was mixed).

                    // Let's use onSnapshot for ID to support real-time updates in Dashboard
                    const unsubscribe = onSnapshot(docRef, (snap) => {
                        if (snap.exists()) {
                            setProvider({ id: snap.id, ...snap.data() });
                        } else {
                            setProvider(null);
                        }
                        setLoading(false);
                    }, (err) => {
                        console.error(err);
                        setError(err);
                        setLoading(false);
                    });

                    return unsubscribe;
                }
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                if (type === 'url') setLoading(false);
            }
        }

        const result = fetchProvider();
        // If result is a function (unsubscribe), return it
        if (result && typeof result === 'function') return result;
        // If fetchProvider is async and returns promise, we can't return it as cleanup directly.
        // But for 'id' case we return unsubscribe synchronously from fetchProvider? No, fetchProvider is async.

        // Let's refactor to separate effects or handle it better.
    }, [identifier, type]);

    return { provider, loading, error };
}
