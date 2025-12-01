import { useState, useEffect } from 'react';
import { authService, UserProfile } from '../services/authService';
import { User, UserCredential } from 'firebase/auth';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = authService.subscribeToAuth((u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = (email: string, password: string): Promise<UserCredential> => {
        return authService.login(email, password);
    };

    const logout = (): Promise<void> => {
        return authService.logout();
    };

    const checkAvailability = (field: string, value: string): Promise<boolean> => {
        return authService.checkAvailability(field, value);
    };

    const register = (email: string, password: string, profileData: UserProfile): Promise<User> => {
        return authService.register(email, password, profileData);
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
