import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId, COLLECTIONS } from './lib/firebase';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PublicBooking from './pages/PublicBooking';

// Helper for public booking route
function PublicBookingRoute({ showToast }) {
    const { businessName } = useParams();
    const navigate = useNavigate();
    return (
        <PublicBooking
            businessName={businessName}
            onBack={() => navigate('/')}
            showToast={showToast}
        />
    );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [providerProfile, setProviderProfile] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        // Initial anonymous sign-in to ensure we can read the DB
        signInAnonymously(auth).catch(console.error);

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u || null);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS, user.uid);
        const unsub = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setProviderProfile(snap.data());
            }
        });
        return () => unsub();
    }, [user]);

    const handleLogout = async () => {
        setProviderProfile(null);
        await signOut(auth);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Router>
            <div className="font-sans text-gray-900">
                {/* Global Toast Notification */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
                        {toast.message}
                    </div>
                )}
                <Routes>
                    <Route
                        path="/:businessName/schedule"
                        element={<PublicBookingRoute showToast={showToast} />}
                    />
                    <Route
                        path="/"
                        element={
                            <LandingPage
                                onLogin={() => window.location.href = '/auth'}
                                onGetStarted={() => window.location.href = '/auth'}
                                isLoggedIn={!!(user && providerProfile)}
                                businessName={providerProfile?.businessUrl}
                            />
                        }
                    />
                    <Route
                        path="/auth"
                        element={
                            <AuthPage
                                user={user}
                                showToast={showToast}
                                onComplete={() => window.location.href = '/dashboard'}
                            />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            user && providerProfile ? (
                                <Dashboard
                                    user={user}
                                    profile={providerProfile}
                                    onLogout={handleLogout}
                                    showToast={showToast}
                                    onPreviewPublic={() => window.open(`/${providerProfile.businessUrl}/schedule`, "_blank")}
                                />
                            ) : (
                                <LandingPage
                                    onLogin={() => window.location.href = '/auth'}
                                    onGetStarted={() => window.location.href = '/auth'}
                                    isLoggedIn={false}
                                />
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}