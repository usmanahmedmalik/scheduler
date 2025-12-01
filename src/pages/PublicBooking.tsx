import React, { useState, FormEvent } from 'react';
import { CheckCircle, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Button, Input } from '../components/ui/Primitives';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { useProvider } from '../hooks/useProvider';
import { useBooking } from '../hooks/useBooking';

interface PublicBookingProps {
    providerId?: string;
    businessName?: string;
    onBack: () => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
    currentUser?: any;
}

export default function PublicBooking({ providerId, businessName, onBack, showToast }: PublicBookingProps) {
    const { provider, loading: providerLoading } = useProvider(businessName || providerId, businessName ? 'url' : 'id');
    const [step, setStep] = useState<number>(1);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [clientForm, setClientForm] = useState({ name: '', email: '' });

    const { timeSlots, submitBooking, loading: bookingLoading } = useBooking(provider?.id, selectedService, selectedDate, provider?.settings);

    const handleBooking = async (e: FormEvent) => {
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

    if (providerLoading) {
        return (
            <div className="min-h-screen bg-gray-100 py-10 px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                    <Skeleton className="h-12 w-3/4 mb-6" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!provider) return <div className="flex h-screen items-center justify-center text-red-500">Provider not found.</div>;

    const steps = ['Service', 'Date & Time', 'Details', 'Done'];

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white relative">
                    <button onClick={onBack} className="absolute top-6 right-6 text-indigo-200 hover:text-white text-sm bg-indigo-700 px-3 py-1 rounded-full">Home</button>
                    <h1 className="text-2xl font-bold">{provider.businessName}</h1>
                    <p className="text-indigo-200 text-sm mt-1">Book your appointment in few simple steps</p>
                </div>

                <div className="p-8">
                    <div className="mb-8">
                        <ProgressBar currentStep={step} totalSteps={4} labels={steps} />
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                                <BriefcaseIcon className="w-5 h-5 text-indigo-600" /> Select Service
                            </h2>
                            <div className="grid gap-3">
                                {provider.services?.map((s: any) => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSelectedService(s); setStep(2); }}
                                        className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900 group-hover:text-indigo-700">{s.name}</span>
                                            <span className="font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full text-sm">
                                                {provider.settings?.currency}{s.price}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {s.duration} mins
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-6 hover:text-indigo-600 transition-colors">← Back to Services</button>

                            <h2 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-indigo-600" /> Select Date & Time
                            </h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    onChange={e => setSelectedDate(e.target.value)}
                                    value={selectedDate}
                                />
                            </div>

                            {selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                                    {bookingLoading ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10" />)}
                                        </div>
                                    ) : timeSlots.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {timeSlots.map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => { setSelectedTime(t); setStep(3); }}
                                                    className="p-2 border border-gray-200 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-sm font-medium"
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">No slots available for this date.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleBooking} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button type="button" onClick={() => setStep(2)} className="text-sm text-gray-500 mb-6 hover:text-indigo-600 transition-colors">← Back to Time</button>

                            <h2 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" /> Your Details
                            </h2>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                                <p className="text-sm text-gray-600 flex justify-between"><span>Service:</span> <span className="font-medium text-gray-900">{selectedService?.name}</span></p>
                                <p className="text-sm text-gray-600 flex justify-between"><span>Date:</span> <span className="font-medium text-gray-900">{selectedDate}</span></p>
                                <p className="text-sm text-gray-600 flex justify-between"><span>Time:</span> <span className="font-medium text-gray-900">{selectedTime}</span></p>
                                <p className="text-sm text-gray-600 flex justify-between mt-2 pt-2 border-t border-gray-200"><span>Price:</span> <span className="font-bold text-indigo-600">{provider.settings?.currency}{selectedService?.price}</span></p>
                            </div>

                            <div className="space-y-4">
                                <Input label="Full Name" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} required placeholder="John Doe" />
                                <Input label="Email Address" type="email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} required placeholder="john@example.com" />
                            </div>

                            <Button type="submit" className="w-full mt-8 h-12 text-lg">
                                Confirm Booking
                            </Button>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="text-center py-10 animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                            <p className="text-gray-600 mb-8">We've sent a confirmation email to {clientForm.email}</p>

                            <div className="bg-gray-50 p-6 rounded-xl max-w-sm mx-auto mb-8 text-left border border-gray-200 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">Service</p>
                                <p className="font-semibold text-gray-900 mb-4">{selectedService?.name}</p>

                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Date</p>
                                        <p className="font-semibold text-gray-900">{selectedDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">Time</p>
                                        <p className="font-semibold text-gray-900">{selectedTime}</p>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={onBack} variant="secondary" className="w-full max-w-xs">Return to Home</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper icon component since Briefcase is not imported
function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    )
}
