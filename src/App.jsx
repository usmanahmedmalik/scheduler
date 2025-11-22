import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId, COLLECTIONS } from './lib/firebase';

// Import Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PublicBooking from './pages/PublicBooking';

export default function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('home'); // Options: 'home', 'auth', 'dashboard', 'public_booking'
    const [loading, setLoading] = useState(true);
    const [providerProfile, setProviderProfile] = useState(null);

    // Used when viewing the Public Page
    const [targetProviderId, setTargetProviderId] = useState(null);

    // Global Toast Notification State
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- 1. Auth & Data Logic ---
    useEffect(() => {
        // Initial anonymous sign-in to ensure we can read the DB
        signInAnonymously(auth).catch(console.error);

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
            } else {
                // If logged out, reset user and sign in anonymously again to allow "Guest" access
                setUser(null);
                signInAnonymously(auth);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- 2. Profile Sync ---
    // Once we have a user, check if they have a Provider Profile in the DB
    useEffect(() => {
        if (!user) return;

        const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS, user.uid);
        const unsub = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setProviderProfile(snap.data());

                // Auto-redirect to dashboard if they are on the home/auth screen and have a profile
                if (view === 'auth' || view === 'home') {
                    setView('dashboard');
                }
            }
        });
        return () => unsub();
    }, [user, view]);

    // --- 3. Handlers ---
    const handleLogout = async () => {
        setProviderProfile(null);
        setView('home');
        await signOut(auth);
    };

    const handlePreviewPublic = () => {
        setTargetProviderId(user.uid);
        setView('public_booking');
    };

    // --- 4. Render ---

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="font-sans text-gray-900">
            {/* Global Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
                    {toast.message}
                </div>
            )}

            {/* Landing Page */}
            {view === 'home' && (
                <LandingPage
                    onLogin={() => setView('auth')}
                    onGetStarted={() => user && providerProfile ? setView('dashboard') : setView('auth')}
                    isLoggedIn={!!(user && providerProfile)}
                />
            )}

            {/* Auth (Login/Register) Page */}
            {view === 'auth' && (
                <AuthPage
                    user={user}
                    showToast={showToast}
                    onComplete={() => setView('dashboard')}
                />
            )}

            {/* Provider Dashboard */}
            {view === 'dashboard' && user && providerProfile && (
                <Dashboard
                    user={user}
                    profile={providerProfile}
                    onLogout={handleLogout}
                    showToast={showToast}
                    onPreviewPublic={handlePreviewPublic}
                />
            )}

            {/* Public Booking Page (Client View) */}
            {view === 'public_booking' && (
                <PublicBooking
                    providerId={targetProviderId}
                    showToast={showToast}
                    currentUser={user}
                    onBack={() => user ? setView('dashboard') : setView('home')}
                />
            )}
        </div>
    );
}