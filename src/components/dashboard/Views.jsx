import React, { useState, useEffect } from 'react';
import { doc, setDoc, query, collection, onSnapshot, where, getDocs } from 'firebase/firestore';
import { Clock, Trash2, Plus, User, Calendar, Briefcase } from 'lucide-react';
import { db, appId, COLLECTIONS } from '../../lib/firebase';
import { Button, Card, Input } from '../ui/Primitives';

// --- Settings View ---
export function SettingsView({ profile, userId, showToast }) {
    const [settings, setSettings] = useState(profile.settings || {});
    const [businessUrl, setBusinessUrl] = useState(profile.businessUrl || "");
    const [saving, setSaving] = useState(false);

    const validateBusinessUrl = (url) => /^[a-zA-Z0-9_-]+$/.test(url);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Validate businessUrl
            if (!businessUrl || !validateBusinessUrl(businessUrl)) {
                showToast("Business URL must only contain letters, numbers, hyphens, or underscores.", "error");
                setSaving(false);
                return;
            }
            // Check uniqueness if changed
            if (businessUrl !== profile.businessUrl) {
                const providersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS);
                const qUrl = query(providersRef, where("businessUrl", "==", businessUrl));
                const snapUrl = await getDocs(qUrl);
                // If exists and not current user, block change
                if (!snapUrl.empty && snapUrl.docs[0].id !== userId) {
                    showToast("Business URL already exists. Please choose another.", "error");
                    setSaving(false);
                    return;
                }
            }
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS, userId);
            await setDoc(docRef, { settings, businessUrl }, { merge: true });
            showToast("Settings updated successfully");
        } catch (error) {
            showToast("Failed to save settings", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Info</h3>
                <Input
                    label="Business URL"
                    value={businessUrl}
                    onChange={e => setBusinessUrl(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    required
                    placeholder="e.g. mybusiness"
                />
            </Card>
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Day Start" type="time" value={settings.dayStart || "09:00"} onChange={e => setSettings({...settings, dayStart: e.target.value})} />
                    <Input label="Day End" type="time" value={settings.dayEnd || "17:00"} onChange={e => setSettings({...settings, dayEnd: e.target.value})} />
                </div>
            </Card>
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Appointment Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Gap (min)" type="number" min="0" value={settings.gapMinutes || 15} onChange={e => setSettings({...settings, gapMinutes: parseInt(e.target.value)})} />
                    <Input label="Currency" value={settings.currency || "$"} onChange={e => setSettings({...settings, currency: e.target.value})} />
                </div>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
        </div>
    );
}

// --- Services View ---
export function ServicesView({ profile, userId, showToast }) {
    const [services, setServices] = useState(profile.services || []);
    const [isAdding, setIsAdding] = useState(false);
    const [newService, setNewService] = useState({ name: '', duration: 30, price: 0 });

    const saveServices = async (updatedServices) => {
        try {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.PROVIDERS, userId);
            await setDoc(docRef, { services: updatedServices }, { merge: true });
            setServices(updatedServices);
            return true;
        } catch (error) {
            showToast("Failed to update services", "error");
            return false;
        }
    };

    const handleAdd = async () => {
        if (!newService.name) return;
        const serviceWithId = { ...newService, id: Date.now().toString() };
        const success = await saveServices([...services, serviceWithId]);
        if (success) {
            setIsAdding(false);
            setNewService({ name: '', duration: 30, price: 0 });
            showToast("Service added");
        }
    };

    const handleDelete = async (id) => {
        const success = await saveServices(services.filter(s => s.id !== id));
        if (success) showToast("Service deleted", "error");
    };

    return (
        <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-500">{services.length} Services defined</div>
                <Button onClick={() => setIsAdding(true)} size="sm"><Plus className="w-4 h-4" /> Add Service</Button>
            </div>
            {isAdding && (
                <Card className="p-6 mb-6 border-indigo-100 bg-indigo-50/30">
                    <h4 className="font-semibold mb-4 text-indigo-900">New Service Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-1"><Input label="Service Name" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="e.g. Haircut"/></div>
                        <Input label="Duration (min)" type="number" value={newService.duration} onChange={e => setNewService({...newService, duration: parseInt(e.target.value)})} />
                        <Input label="Price" type="number" value={newService.price} onChange={e => setNewService({...newService, price: parseInt(e.target.value)})} />
                    </div>
                    <div className="flex gap-2 justify-end"><Button variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button><Button onClick={handleAdd}>Save Service</Button></div>
                </Card>
            )}
            <div className="space-y-3">
                {services.map(service => (
                    <Card key={service.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <h4 className="font-bold text-gray-900">{service.name}</h4>
                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration} mins</span>
                                <span className="font-medium text-gray-700">{profile.settings?.currency}{service.price}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(service.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// --- Appointments View ---
export function AppointmentsView({ userId }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.APPOINTMENTS));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const myAppointments = all.filter(appt => appt.providerId === userId);
            myAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
            setAppointments(myAppointments);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [userId]);

    if (loading) return <div className="text-gray-500">Loading appointments...</div>;

    return (
        <div className="max-w-4xl">
            <div className="space-y-4">
                {appointments.length === 0 && <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">No appointments scheduled yet.</div>}
                {appointments.map(appt => (
                    <Card key={appt.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-indigo-100 text-indigo-700 p-3 rounded-lg hidden md:block"><User className="w-6 h-6" /></div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-lg text-gray-900">{appt.clientName}</h4>
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Confirmed</span>
                                </div>
                                <div className="text-gray-600 text-sm flex flex-col sm:flex-row gap-1 sm:gap-4">
                                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {appt.serviceName}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {appt.date}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.time}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}