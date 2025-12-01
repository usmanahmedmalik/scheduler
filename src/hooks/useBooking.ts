import { useState, useMemo, useEffect } from 'react';
import { bookingService, Booking } from '../services/bookingService';
import { FirestoreError } from 'firebase/firestore';

interface Service {
    duration: number;
    [key: string]: any;
}

interface ProviderSettings {
    dayStart?: string;
    dayEnd?: string;
    gapMinutes?: number;
    [key: string]: any;
}

export function useBooking(providerId: string | undefined, service: Service | null, selectedDate: string | undefined, providerSettings: ProviderSettings | undefined) {
    const [existingAppts, setExistingAppts] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<FirestoreError | Error | null>(null);

    // Fetch existing appointments
    useEffect(() => {
        if (!providerId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = bookingService.subscribeToAppointments(
            providerId,
            (appts) => {
                setExistingAppts(appts);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [providerId]);

    // Calculate slots
    const timeSlots = useMemo(() => {
        if (!service || !selectedDate || !providerSettings) return [];

        const { dayStart = "09:00", dayEnd = "17:00", gapMinutes = 15 } = providerSettings;
        const duration = service.duration;
        const slots: string[] = [];
        let current = new Date(`${selectedDate}T${dayStart}`);
        const end = new Date(`${selectedDate}T${dayEnd}`);

        while (current < end) {
            const timeString = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const isBlocked = existingAppts.some(appt => appt.date === selectedDate && appt.time === timeString);
            if (!isBlocked) slots.push(timeString);
            current.setMinutes(current.getMinutes() + duration + gapMinutes);
        }
        return slots;
    }, [service, selectedDate, existingAppts, providerSettings]);

    const submitBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt' | 'providerId'>) => {
        if (!providerId) throw new Error("Provider ID is missing");
        try {
            await bookingService.createBooking({
                ...bookingData,
                providerId
            });
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return { existingAppts, timeSlots, submitBooking, loading, error };
}
