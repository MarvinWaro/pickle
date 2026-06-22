import {
    Head,
    Link,
    router,
    useForm,
    usePage,
    usePoll,
} from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CalendarOff,
    LandPlot,
    MapPin,
    X,
} from 'lucide-react';
import { useEffect } from 'react';
import { store as storeBooking } from '@/actions/App/Http/Controllers/BookingController';
import CourtController from '@/actions/App/Http/Controllers/CourtController';
import InputError from '@/components/input-error';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatPeso } from '@/lib/utils';
import { login } from '@/routes';
import type { Auth, Court } from '@/types';

type Slot = {
    id: string;
    label: string;
    price: number;
    state: 'available' | 'held' | 'booked';
    available: boolean;
};

type CourtShowProps = {
    court: Court;
    date: string;
    minDate: string;
    maxDate: string;
    slots: Slot[];
    closed: boolean;
    closureReason: string | null;
};

function addDays(date: string, days: number): string {
    const next = new Date(`${date}T00:00:00`);
    next.setDate(next.getDate() + days);

    // Build the YYYY-MM-DD from local parts — toISOString() would shift the
    // day in timezones ahead of UTC (e.g. Asia/Manila).
    const year = next.getFullYear();
    const month = String(next.getMonth() + 1).padStart(2, '0');
    const day = String(next.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDate(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function CourtShow({
    court,
    date,
    minDate,
    maxDate,
    slots,
    closed,
    closureReason,
}: CourtShowProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const form = useForm<{
        court_id: string;
        time_slot_ids: string[];
        booking_date: string;
        guest_name: string;
        guest_phone: string;
    }>({
        court_id: court.id,
        time_slot_ids: [],
        booking_date: date,
        guest_name: '',
        guest_phone: '',
    });

    // Keep availability fresh without a manual refresh — expired holds free up
    // and newly-taken slots show as booked within ~15s.
    usePoll(15000, { only: ['slots'] });

    const selectedIds = form.data.time_slot_ids;
    const selectedSlots = slots.filter((slot) => selectedIds.includes(slot.id));
    const total = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    const tomorrow = addDays(minDate, 1);

    // Drop any selected slot that became unavailable after a refresh.
    useEffect(() => {
        const availableIds = slots
            .filter((slot) => slot.available)
            .map((slot) => slot.id);
        const pruned = selectedIds.filter((id) => availableIds.includes(id));

        if (pruned.length !== selectedIds.length) {
            form.setData('time_slot_ids', pruned);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slots]);

    function toggleSlot(id: string) {
        form.setData(
            'time_slot_ids',
            selectedIds.includes(id)
                ? selectedIds.filter((slotId) => slotId !== id)
                : [...selectedIds, id],
        );
    }

    function changeDate(nextDate: string) {
        form.setData('time_slot_ids', []);
        router.get(
            CourtController.show(court.id).url,
            { date: nextDate },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    }

    function reserve(event: React.FormEvent) {
        event.preventDefault();
        form.transform((data) => ({ ...data, booking_date: date }));
        form.post(storeBooking().url, { preserveScroll: true });
    }

    const dateOptions = [
        { label: 'Today', value: minDate },
        { label: 'Tomorrow', value: tomorrow },
    ];

    return (
        <>
            <Head title={`Book ${court.name}`} />

            <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-neutral-900 dark:from-emerald-950/40 dark:via-neutral-950 dark:to-neutral-950 dark:text-neutral-100">
                <SiteHeader />

                <main className="mx-auto w-full max-w-6xl px-6 pb-20">
                    <Link
                        href="/"
                        className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                        ← Back to courts
                    </Link>

                    <div className="mt-4 grid gap-6 lg:grid-cols-3">
                        {/* Court details + slots */}
                        <div className="space-y-6 lg:col-span-2">
                            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="aspect-[21/9] bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-neutral-900">
                                    {court.image_url ? (
                                        <img
                                            src={court.image_url}
                                            alt={court.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-emerald-600/60 dark:text-emerald-400/40">
                                            <LandPlot className="size-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3 p-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-2xl font-bold">
                                            {court.name}
                                        </h1>
                                        {court.surface && (
                                            <span className="inline-flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                                                <MapPin className="size-3.5" />
                                                {court.surface}
                                            </span>
                                        )}
                                    </div>
                                    {court.description && (
                                        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                                            {court.description}
                                        </p>
                                    )}
                                    {court.amenities &&
                                        court.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {court.amenities.map(
                                                    (amenity) => (
                                                        <Badge
                                                            key={amenity.id}
                                                            variant="secondary"
                                                        >
                                                            {amenity.name}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarDays className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        Pick a date &amp; time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {dateOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    changeDate(option.value)
                                                }
                                                className={cn(
                                                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                                                    date === option.value
                                                        ? 'bg-emerald-600 text-white shadow-sm'
                                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
                                                )}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                        <input
                                            type="date"
                                            value={date}
                                            min={minDate}
                                            max={maxDate}
                                            onChange={(event) =>
                                                changeDate(event.target.value)
                                            }
                                            className="rounded-full border border-neutral-200 bg-transparent px-4 py-1.5 text-sm dark:border-neutral-700"
                                        />
                                    </div>

                                    {closed && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900 dark:bg-amber-950/30">
                                            <CalendarOff className="mx-auto size-7 text-amber-600 dark:text-amber-400" />
                                            <p className="mt-2 font-medium text-amber-800 dark:text-amber-200">
                                                Closed on this date
                                            </p>
                                            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                                                {closureReason ??
                                                    'The venue is closed for bookings on this day.'}{' '}
                                                Please pick another day.
                                            </p>
                                        </div>
                                    )}

                                    {!closed && (
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Select one or more slots — book a
                                            single hour or a full block.
                                        </p>
                                    )}

                                    {!closed &&
                                        (slots.length === 0 ? (
                                            <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                                No time slots are configured for
                                                this court yet.
                                            </p>
                                        ) : (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {slots.map((slot) => {
                                                    const isSelected =
                                                        selectedIds.includes(
                                                            slot.id,
                                                        );

                                                    return (
                                                        <button
                                                            key={slot.id}
                                                            type="button"
                                                            disabled={
                                                                !slot.available
                                                            }
                                                            onClick={() =>
                                                                toggleSlot(
                                                                    slot.id,
                                                                )
                                                            }
                                                            className={cn(
                                                                'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors',
                                                                slot.state ===
                                                                    'booked' &&
                                                                    'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600',
                                                                slot.state ===
                                                                    'held' &&
                                                                    'cursor-not-allowed border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300',
                                                                slot.available &&
                                                                    !isSelected &&
                                                                    'border-emerald-200 bg-emerald-50/60 hover:border-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/30',
                                                                isSelected &&
                                                                    'border-emerald-600 bg-emerald-600 text-white',
                                                            )}
                                                        >
                                                            <span className="text-sm font-medium">
                                                                {slot.label}
                                                            </span>
                                                            <span className="text-sm font-semibold">
                                                                {slot.state ===
                                                                    'available' &&
                                                                    formatPeso(
                                                                        slot.price,
                                                                    )}
                                                                {slot.state ===
                                                                    'held' &&
                                                                    'On hold'}
                                                                {slot.state ===
                                                                    'booked' &&
                                                                    'Booked'}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ))}

                                    {!closed && (
                                        <div className="space-y-1.5">
                                            <p className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="size-3 rounded-full bg-emerald-500" />
                                                    Available
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="size-3 rounded-full bg-amber-400" />
                                                    On hold
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <span className="size-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                                    Booked
                                                </span>
                                            </p>
                                            <p className="text-xs text-neutral-400">
                                                On-hold slots are reserved by
                                                someone who hasn't paid yet — they
                                                free up automatically if the hold
                                                expires. This list refreshes on
                                                its own.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Booking summary */}
                        <div>
                            <Card className="lg:sticky lg:top-6">
                                <CardHeader>
                                    <CardTitle>Booking summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                            Date
                                        </span>
                                        <span className="text-right font-medium">
                                            {formatDate(date)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 border-t pt-4">
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Selected slots
                                            {selectedSlots.length > 0 &&
                                                ` (${selectedSlots.length})`}
                                        </p>
                                        {selectedSlots.length === 0 ? (
                                            <p className="text-sm text-neutral-400">
                                                No slots selected yet.
                                            </p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {selectedSlots.map((slot) => (
                                                    <li
                                                        key={slot.id}
                                                        className="flex items-center justify-between gap-2 text-sm"
                                                    >
                                                        <span>
                                                            {slot.label}
                                                        </span>
                                                        <span className="flex items-center gap-2">
                                                            <span className="font-medium">
                                                                {formatPeso(
                                                                    slot.price,
                                                                )}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleSlot(
                                                                        slot.id,
                                                                    )
                                                                }
                                                                className="rounded-sm p-0.5 text-neutral-400 hover:text-foreground"
                                                                aria-label={`Remove ${slot.label}`}
                                                            >
                                                                <X className="size-3.5" />
                                                            </button>
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="flex items-end justify-between border-t pt-4">
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Total
                                        </span>
                                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatPeso(total)}
                                        </span>
                                    </div>

                                    <form
                                        onSubmit={reserve}
                                        className="space-y-3"
                                    >
                                        {!auth.user && (
                                            <div className="space-y-3 border-t pt-4">
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="guest_name">
                                                        Your name
                                                    </Label>
                                                    <Input
                                                        id="guest_name"
                                                        value={
                                                            form.data.guest_name
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'guest_name',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Full name"
                                                    />
                                                    <InputError
                                                        message={
                                                            form.errors
                                                                .guest_name
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="guest_phone">
                                                        Phone
                                                    </Label>
                                                    <Input
                                                        id="guest_phone"
                                                        value={
                                                            form.data
                                                                .guest_phone
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'guest_phone',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="09xx xxx xxxx"
                                                    />
                                                    <InputError
                                                        message={
                                                            form.errors
                                                                .guest_phone
                                                        }
                                                    />
                                                </div>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    Booking as a guest.{' '}
                                                    <Link
                                                        href={login()}
                                                        className="text-emerald-600 hover:underline dark:text-emerald-400"
                                                    >
                                                        Log in
                                                    </Link>{' '}
                                                    to track your bookings &amp;
                                                    spending.
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={
                                                selectedSlots.length === 0 ||
                                                form.processing
                                            }
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {form.processing
                                                ? 'Reserving…'
                                                : 'Reserve & pay'}
                                            <ArrowRight className="size-4" />
                                        </button>
                                    </form>

                                    <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                                        Your slots are held for a few minutes
                                        while you pay.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
