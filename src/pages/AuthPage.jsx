import React, { useState } from 'react';
import { doc, setDoc, collection, getDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Loader2, ArrowRight } from 'lucide-react';
import { db, appId, COLLECTIONS, auth } from '../lib/firebase';
import { Button, Input } from '../components/ui/Primitives';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function AuthPage({ onComplete, showToast }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ businessName: '', email: '', password: '', subscription: 'free' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let userCredential;
            if (isRegister) {
                // Check if business name already exists
                const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
                const qBusiness = query(providersRef, where("businessName", "==", formData.businessName));
                const snapBusiness = await getDocs(qBusiness);
                if (!snapBusiness.empty) {
                    showToast("Business name already exists. Please choose another.", "error");
                    setSubmitting(false);
                    return;
                }
                // Check if email already exists
                const qEmail = query(providersRef, where("email", "==", formData.email));
                const snapEmail = await getDocs(qEmail);
                if (!snapEmail.empty) {
                    showToast("Email already exists. Please use another email.", "error");
                    setSubmitting(false);
                    return;
                }
                // Register user with Firebase Auth
                userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;
                // Create provider profile in Firestore
                const userDocRef = doc(providersRef, user.uid);
                const newProfile = {
                    businessName: formData.businessName,
                    email: formData.email,
                    subscription: formData.subscription,
                    createdAt: serverTimestamp(),
                    settings: { gapMinutes: 15, dayStart: "09:00", dayEnd: "17:00", currency: "$" },
                    services: []
                };
                await setDoc(userDocRef, newProfile, { merge: true });
                showToast("Welcome to Schedulr!");
                onComplete(user);
            } else {
                // Login user with Firebase Auth
                userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;
                // Check provider profile exists
                const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
                const userDocRef = doc(providersRef, user.uid);
                const snap = await getDoc(userDocRef);
                if (snap.exists()) {
                    showToast("Logged in successfully!");
                    onComplete(user);
                } else {
                    showToast("Account not found. Please register.", "error");
                    setIsRegister(true);
                }
            }
        } catch (err) {
            // Handle Firebase "operation-not-allowed" error
            if (err.code === "auth/operation-not-allowed") {
                showToast(
                    "Email/password sign-in is not enabled. Please enable it in your Firebase Console: Authentication > Sign-in method > Email/Password.",
                    "error"
                );
            } else if (err.code === "auth/user-not-found") {
                showToast("No account found for this email. Please register.", "error");
                setIsRegister(true);
            } else if (err.code === "auth/wrong-password") {
                showToast("Incorrect password. Please try again.", "error");
            } else {
                showToast(err.message || "Authentication failed.", "error");
            }
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && <Input label="Business Name" required value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />}
                    <Input label="Email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <Input label="Password" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin w-4 h-4"/> : (isRegister ? 'Get Started' : 'Sign In')}
                    </Button>
                </form>
                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                    <button onClick={() => setIsRegister(!isRegister)} className="text-indigo-600 font-semibold flex items-center justify-center gap-1 mx-auto">
                        {isRegister ? 'Log in here' : 'Create an account'} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}