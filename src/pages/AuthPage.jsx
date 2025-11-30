import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button, Input } from '../components/ui/Primitives';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage({ onComplete, showToast }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ businessName: '', businessUrl: '', email: '', password: '', subscription: 'free' });
    const [submitting, setSubmitting] = useState(false);
    const { login, register, checkAvailability } = useAuth();

    const validateBusinessUrl = (url) => {
        // Only allow letters, numbers, hyphens, underscores
        return /^[a-zA-Z0-9_-]+$/.test(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (isRegister) {
                // Validate businessUrl
                if (!formData.businessUrl || !validateBusinessUrl(formData.businessUrl)) {
                    showToast("Business URL must only contain letters, numbers, hyphens, or underscores.", "error");
                    setSubmitting(false);
                    return;
                }

                // Check availability
                const urlExists = !(await checkAvailability("businessUrl", formData.businessUrl));
                if (urlExists) {
                    showToast("Business URL already exists. Please choose another.", "error");
                    setSubmitting(false);
                    return;
                }

                const nameExists = !(await checkAvailability("businessName", formData.businessName));
                if (nameExists) {
                    showToast("Business name already exists. Please choose another.", "error");
                    setSubmitting(false);
                    return;
                }

                const emailExists = !(await checkAvailability("email", formData.email));
                if (emailExists) {
                    showToast("Email already exists. Please use another email.", "error");
                    setSubmitting(false);
                    return;
                }

                // Register
                const user = await register(formData.email, formData.password, {
                    businessName: formData.businessName,
                    businessUrl: formData.businessUrl,
                    email: formData.email,
                    subscription: formData.subscription
                });

                showToast("Welcome to Schedulr!");
                onComplete(user);
            } else {
                // Login
                const userCredential = await login(formData.email, formData.password);
                const user = userCredential.user;

                // We might want to check if profile exists here too, but for now let's assume it does if login works
                // or let the dashboard handle the "no profile" case.
                // The original code checked for profile existence.
                // Let's keep it simple for now, as useAuth login returns userCredential.

                showToast("Logged in successfully!");
                onComplete(user);
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
                const errorMessage = err.message || "Authentication failed.";
                showToast(errorMessage.replace("Firebase: ", ""), "error");
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
                    {isRegister && <Input label="Business Name" required value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />}
                    {isRegister && <Input label="Business URL" required value={formData.businessUrl} onChange={e => setFormData({ ...formData, businessUrl: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })} placeholder="e.g. mybusiness" />}
                    <Input label="Email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <Input label="Password" type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : (isRegister ? 'Get Started' : 'Sign In')}
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