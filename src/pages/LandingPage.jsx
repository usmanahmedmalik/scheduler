import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ onGetStarted, onLogin, isLoggedIn, businessName }) {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-indigo-50">
            {/* NAV */}
            <nav className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
                    <Calendar className="h-8 w-8" />
                    NextAgenda.app
                </div>
                <button onClick={onLogin} className="text-gray-600 hover:text-indigo-600 font-medium">
                    {isLoggedIn ? 'Go to Dashboard' : 'Log In'}
                </button>
            </nav>

            {/* HERO SECTION */}
            <main className="flex-grow flex flex-col items-center justify-center text-center px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                        Simple <span className="text-indigo-600">appointment scheduling</span><br/>for small businesses.
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Manage bookings, set availability, and let customers schedule with you in seconds.
                        No clutter. No complexity. Just a clean, free scheduling tool that works.
                    </p>
                    <button
                        onClick={() => {
                            if (isLoggedIn && businessName) {
                                window.location.href = `/${businessName}/schedule`;
                            } else {
                                onGetStarted();
                            }
                        }}
                        className="px-10 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 shadow-xl transition-all"
                    >
                        {isLoggedIn ? 'Go to Dashboard' : 'Start Free'}
                    </button>
                </div>
            </main>

            {/* FEATURE HIGHLIGHTS */}
            <section className="py-20 bg-white px-6">
                <div className="max-w-6xl mx-auto text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900">Built for small businesses</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    <div className="p-8 rounded-2xl bg-indigo-50 shadow-sm text-center">
                        <CheckCircle2 className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">Easy Bookings</h3>
                        <p className="text-gray-600">Share a simple link and let clients pick a time that works for both of you.</p>
                    </div>

                    <div className="p-8 rounded-2xl bg-indigo-50 shadow-sm text-center">
                        <CheckCircle2 className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">Clean & Modern</h3>
                        <p className="text-gray-600">A minimal, beautiful interface your customers immediately understand.</p>
                    </div>

                    <div className="p-8 rounded-2xl bg-indigo-50 shadow-sm text-center">
                        <CheckCircle2 className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">Your Time, Organized</h3>
                        <p className="text-gray-600">Set availability, manage appointments, and avoid double-booking effortlessly.</p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-10 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} NextAgenda.app — Simple scheduling for small businesses.
            </footer>
        </div>
    );
}