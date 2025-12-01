import { useState, useEffect } from 'react';
import { providerService, Provider } from '../services/providerService';
import { FirestoreError } from 'firebase/firestore';

export function useProvider(identifier: string | undefined, type: 'id' | 'url' = 'id') {
    const [provider, setProvider] = useState<Provider | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<FirestoreError | Error | null>(null);

    useEffect(() => {
        if (!identifier) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        let unsubscribe: (() => void) | undefined;

        async function fetchProvider() {
            try {
                if (type === 'url') {
                    const data = await providerService.getProviderByUrl(identifier!);
                    setProvider(data);
                    setLoading(false);
                } else {
                    // Subscribe to provider updates
                    unsubscribe = providerService.subscribeToProvider(
                        identifier!,
                        (data) => {
                            setProvider(data);
                            setLoading(false);
                        },
                        (err) => {
                            console.error(err);
                            setError(err);
                            setLoading(false);
                        }
                    );
                }
            } catch (err) {
                console.error(err);
                setError(err as Error);
                setLoading(false);
            }
        }

        fetchProvider();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [identifier, type]);

    return { provider, loading, error };
}
