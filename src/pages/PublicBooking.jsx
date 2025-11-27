import React, { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button, Input } from '../components/ui/Primitives';
import { useProvider } from '../hooks/useProvider';
import { useBooking } from '../hooks/useBooking';

export default function PublicBooking({ providerId, businessName, onBack, showToast, currentUser }) {
    const { provider, loading: providerLoading } = useProvider(businessName || providerId, businessName ? 'url' : 'id');
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [clientForm, setClientForm] = useState({ name: '', email: '' });

    const { timeSlots, submitBooking } = useBooking(provider?.id, selectedService, selectedDate, provider?.settings);

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            await submitBooking({
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                date: selectedDate,
                time: selectedTime,
                clientName: clientForm.name,
                clientEmail: clientForm.email
            });
            setStep(4);
        } catch (error) {
            showToast("Booking failed", "error");
        }
    };

    if (providerLoading) return <div className="flex h-screen items-center justify-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>;
    if (!provider) return <div className="flex h-screen items-center justify-center text-red-500">Provider not found.</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white relative">
                    <button onClick={onBack} className="absolute top-6 right-6 text-indigo-200 hover:text-white text-sm bg-indigo-700 px-3 py-1 rounded-full">Home</button>
                    <h1 className="text-2xl font-bold">{provider.businessName}</h1>
                </div>
                <div className="p-8">
                    {/* No login required, always show services and booking */}
                    {step === 1 && (
                        <div className="space-y-3">
                            <h2 className="font-bold text-lg mb-4">Select Service</h2>
                            {provider.services?.map(s => (
                                <button key={s.id} onClick={() => { setSelectedService(s); setStep(2); }} className="w-full text-left p-4 border rounded-xl hover:bg-indigo-50 flex justify-between">
                                    <span>{s.name} ({s.duration}m)</span>
                                    <span className="font-bold">{provider.settings?.currency}{s.price}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {step === 2 && (
                        <div>
                            <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-4">← Back</button>
                            <input type="date" className="w-full p-3 border rounded mb-4" onChange={e => setSelectedDate(e.target.value)} />
                            {selectedDate && (
                                <div className="grid grid-cols-3 gap-2">
                                    {timeSlots.map(t => <button key={t} onClick={() => { setSelectedTime(t); setStep(3); }} className="p-2 border rounded hover:bg-indigo-600 hover:text-white">{t}</button>)}
                                </div>
                            )}
                        </div>
                    )}
                    {step === 3 && (
                        <form onSubmit={handleBooking}>
                            <button type="button" onClick={() => setStep(2)} className="text-sm text-gray-500 mb-4">← Back</button>
                            <Input label="Name" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} required />
                            <Input label="Email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} required />
                            <Button type="submit" className="w-full mt-4">Confirm</Button>
                        </form>
                    )}
                    {step === 4 && (
                        <div className="text-center py-10">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold">Confirmed!</h2>
                            <p className="mb-6">See you on {selectedDate} at {selectedTime}</p>
                            <Button onClick={onBack} variant="secondary">Done</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}