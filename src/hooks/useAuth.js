import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.subscribeToAuth((u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return authService.login(email, password);
    };

    const logout = () => {
        return authService.logout();
    };

    const checkAvailability = (field, value) => {
        return authService.checkAvailability(field, value);
    };

    const register = (email, password, profileData) => {
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
