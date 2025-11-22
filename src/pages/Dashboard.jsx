import React, { useState } from 'react';
import { Calendar, Briefcase, Settings, LogOut, Link as LinkIcon, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/Primitives';
import { SettingsView, ServicesView, AppointmentsView } from '../components/dashboard/Views';

export default function Dashboard({ user, profile, onLogout, onPreviewPublic, showToast }) {
    const [activeTab, setActiveTab] = useState('appointments');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'services', label: 'Services', icon: Briefcase },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="font-bold text-xl text-gray-800">Schedulr.</h1>
                </div>
                <div className="flex-1 p-4 space-y-1">
                    {menuItems.map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <item.icon className="w-5 h-5" /> {item.label}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                    <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm font-medium px-2"><LogOut className="w-4 h-4" /> Sign Out</button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed w-full bg-white border-b border-gray-200 z-20 px-4 py-3 flex items-center justify-between">
                <div className="font-bold text-lg">Schedulr.</div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-100 rounded-md">{isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-4 md:p-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h2>
                    <Button
                        onClick={() => window.open(`/${profile.businessName}/schedule`, "_blank")}
                        variant="secondary"
                    >
                        <LinkIcon className="w-4 h-4" /> Public Page
                    </Button>
                </header>

                {activeTab === 'settings' && <SettingsView profile={profile} userId={user.uid} showToast={showToast} />}
                {activeTab === 'services' && <ServicesView profile={profile} userId={user.uid} showToast={showToast} />}
                {activeTab === 'appointments' && <AppointmentsView userId={user.uid} />}
            </main>
        </div>
    );
}