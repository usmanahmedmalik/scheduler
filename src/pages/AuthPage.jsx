import React, { useState } from 'react';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Loader2, ArrowRight } from 'lucide-react';
import { db, appId, COLLECTIONS } from '../lib/firebase';
import { Button, Input } from '../components/ui/Primitives';

export default function AuthPage({ user, onComplete, showToast }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ businessName: '', email: '', password: '', subscription: 'free' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast("Initializing secure connection...", "error");
            return;
        }
        setSubmitting(true);

        try {
            const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
            const userDocRef = doc(providersRef, user.uid);

            if (isRegister) {
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
                onComplete();
            } else {
                const q = query(providersRef, where("email", "==", formData.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    await setDoc(userDocRef, querySnapshot.docs[0].data(), { merge: true });
                    showToast("Logged in successfully!");
                    onComplete();
                } else {
                    showToast("Account not found. Please register.", "error");
                }
            }
        } catch (err) {
            console.error(err);
            showToast("Authentication failed.", "error");
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
                    <Button type="submit" className="w-full" disabled={submitting || !user}>
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