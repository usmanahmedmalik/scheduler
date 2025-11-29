import { useState, useEffect } from 'react';
import { providerService } from '../services/providerService';

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
                    const data = await providerService.getProviderByUrl(identifier);
                    setProvider(data);
                    setLoading(false);
                } else {
                    // Subscribe to provider updates
                    const unsubscribe = providerService.subscribeToProvider(
                        identifier,
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
                    return unsubscribe;
                }
            } catch (err) {
                console.error(err);
                setError(err);
                setLoading(false);
            }
        }

        const result = fetchProvider();
        if (result && typeof result === 'function') return result;
    }, [identifier, type]);

    return { provider, loading, error };
}
