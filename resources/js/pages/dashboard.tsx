import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    CalendarDays,
    ClipboardList,
    Flame,
    LandPlot,
    Plus,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { index as adminBookings } from '@/actions/App/Http/Controllers/Admin/BookingController';
import {
    cancel,
    pay,
} from '@/actions/App/Http/Controllers/BookingController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { statusMetaFor } from '@/lib/booking-status';
import { formatBookingDate, formatPeso } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as courtsIndex } from '@/routes/admin/courts';
import type { Auth } from '@/types';

type Stats = {
    total_spent: number;
    sessions: number;
    days_played: number;
    streak: number;
};

type BookingRow = {
    reference_code: string;
    court_name: string;
    booking_date: string;
    slots: string[];
    amount: number | string;
    status: string;
    notes: string | null;
    can_cancel: boolean;
};

type AdminStats = {
    today_count: number;
    pending_count: number;
    confirmed_count: number;
};

type DashboardProps = {
    stats?: Stats;
    bookings?: BookingRow[];
    admin?: AdminStats;
};

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {icon}
                </span>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function AdminDashboard({ admin }: { admin: AdminStats }) {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    icon={<CalendarCheck className="size-5" />}
                    label="Today's bookings"
                    value={admin.today_count}
                />
                <Link
                    href={adminBookings({
                        query: { status: 'awaiting_confirmation' },
                    })}
                    className="rounded-xl transition-opacity hover:opacity-90"
                >
                    <StatCard
                        icon={<ClipboardList className="size-5" />}
                        label="Awaiting confirmation"
                        value={admin.pending_count}
                    />
                </Link>
                <StatCard
                    icon={<LandPlot className="size-5" />}
                    label="Confirmed"
                    value={admin.confirmed_count}
                />
            </div>
            <div className="flex flex-wrap gap-3">
                <Button asChild className="w-fit">
                    <Link href={adminBookings()}>
                        <ClipboardList />
                        Review bookings
                    </Link>
                </Button>
                <Button asChild variant="outline" className="w-fit">
                    <Link href={courtsIndex()}>
                        <LandPlot />
                        Manage courts
                    </Link>
                </Button>
            </div>
        </>
    );
}

function UserDashboard({
    stats,
    bookings,
}: {
    stats: Stats;
    bookings: BookingRow[];
}) {
    const [toCancel, setToCancel] = useState<BookingRow | null>(null);
    const [cancelling, setCancelling] = useState(false);

    function confirmCancel() {
        if (!toCancel) {
            return;
        }

        router.post(
            cancel(toCancel.reference_code).url,
            {},
            {
                preserveScroll: true,
                onStart: () => setCancelling(true),
                onFinish: () => setCancelling(false),
                onSuccess: () => setToCancel(null),
            },
        );
    }

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<Wallet className="size-5" />}
                    label="Total spent"
                    value={formatPeso(stats.total_spent)}
                />
                <StatCard
                    icon={<CalendarCheck className="size-5" />}
                    label="Sessions booked"
                    value={stats.sessions}
                />
                <StatCard
                    icon={<CalendarDays className="size-5" />}
                    label="Days played"
                    value={stats.days_played}
                />
                <StatCard
                    icon={<Flame className="size-5" />}
                    label="Week streak"
                    value={stats.streak}
                />
            </div>

            <Card className="overflow-hidden py-0">
                <CardHeader className="border-b px-6 py-4">
                    <CardTitle className="flex items-center justify-between">
                        <span>My bookings</span>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/">
                                <Plus />
                                Book a court
                            </Link>
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {bookings.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-14 text-center">
                            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <CalendarDays className="size-6" />
                            </span>
                            <p className="font-medium">No bookings yet</p>
                            <Button asChild size="sm">
                                <Link href="/">Browse courts</Link>
                            </Button>
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {bookings.map((booking) => {
                                const meta = statusMetaFor(booking.status);

                                return (
                                    <li
                                        key={booking.reference_code}
                                        className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium">
                                                {booking.court_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatBookingDate(
                                                    booking.booking_date,
                                                )}{' '}
                                                · {booking.slots.join(', ')}
                                            </p>
                                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                                                {booking.reference_code}
                                            </p>
                                            {(booking.status === 'cancelled' ||
                                                booking.status ===
                                                    'rejected') &&
                                                booking.notes && (
                                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                        Reason: {booking.notes}
                                                    </p>
                                                )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {formatPeso(booking.amount)}
                                            </span>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
                                            >
                                                {meta.label}
                                            </span>
                                            {booking.status ===
                                                'pending_payment' && (
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={pay(
                                                            booking.reference_code,
                                                        )}
                                                    >
                                                        Pay
                                                    </Link>
                                                </Button>
                                            )}
                                            {booking.can_cancel && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setToCancel(booking)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={toCancel !== null}
                onOpenChange={(open) => !open && setToCancel(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel booking</DialogTitle>
                        <DialogDescription>
                            Cancel your booking at{' '}
                            <span className="font-medium text-foreground">
                                {toCancel?.court_name}
                            </span>{' '}
                            on {toCancel?.booking_date}? This frees the slot for
                            others.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setToCancel(null)}
                            disabled={cancelling}
                        >
                            Keep booking
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmCancel}
                            disabled={cancelling}
                        >
                            {cancelling ? 'Cancelling…' : 'Cancel booking'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function Dashboard({ stats, bookings, admin }: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth.user?.role === 'admin';

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {isAdmin && admin ? (
                    <AdminDashboard admin={admin} />
                ) : (
                    <UserDashboard
                        stats={
                            stats ?? {
                                total_spent: 0,
                                sessions: 0,
                                days_played: 0,
                                streak: 0,
                            }
                        }
                        bookings={bookings ?? []}
                    />
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
