import React from 'react';
import { Calendar } from 'lucide-react';

export default function LandingPage({ onGetStarted, onLogin, isLoggedIn, businessName }) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <nav className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
                    <Calendar className="h-8 w-8" />
                    Schedulr.
                </div>
                <button onClick={onLogin} className="text-gray-600 hover:text-indigo-600 font-medium">
                    {isLoggedIn ? 'Go to Dashboard' : 'Log In'}
                </button>
            </nav>

            <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">
                        Booking made <span className="text-indigo-600">effortless</span>.
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Set your availability, define your services, and share your link.
                    </p>
                    <button
                        onClick={() => {
                            if (isLoggedIn && businessName) {
                                window.location.href = `/${businessName}/schedule`;
                            } else {
                                onGetStarted();
                            }
                        }}
                        className="px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 shadow-lg transition-all"
                    >
                        {isLoggedIn ? 'Go to Dashboard' : 'Start for Free'}
                    </button>
                </div>
            </main>
        </div>
    );
}