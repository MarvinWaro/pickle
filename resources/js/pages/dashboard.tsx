import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    CalendarDays,
    ClipboardList,
    LandPlot,
    Plus,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { index as adminBookings } from '@/actions/App/Http/Controllers/Admin/BookingController';
import { cancel, pay } from '@/actions/App/Http/Controllers/BookingController';
import { index as browseCourts } from '@/actions/App/Http/Controllers/CourtController';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { bookingStatusMeta, statusMetaFor } from '@/lib/booking-status';
import { cn, formatBookingDate, formatPeso } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as courtsIndex } from '@/routes/admin/courts';
import type { Auth } from '@/types';

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

function StatusChips({
    bookings,
    statusFilter,
    onChange,
}: {
    bookings: BookingRow[];
    statusFilter: string;
    onChange: (value: string) => void;
}) {
    const { counts, statuses } = useMemo(() => {
        const counts = bookings.reduce<Record<string, number>>(
            (acc, booking) => {
                acc[booking.status] = (acc[booking.status] ?? 0) + 1;

                return acc;
            },
            {},
        );

        return {
            counts,
            statuses: Object.keys(bookingStatusMeta).filter(
                (status) => (counts[status] ?? 0) > 0,
            ),
        };
    }, [bookings]);

    const chipClass = (active: boolean, activeClass: string) =>
        cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            active
                ? activeClass
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
        );

    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => onChange('all')}
                className={chipClass(
                    statusFilter === 'all',
                    'border-emerald-600 bg-emerald-600 text-white',
                )}
            >
                All
                <span className="rounded-full bg-black/10 px-1.5 dark:bg-white/15">
                    {bookings.length}
                </span>
            </button>

            {statuses.map((status) => {
                const meta = statusMetaFor(status);
                const active = statusFilter === status;

                return (
                    <button
                        key={status}
                        type="button"
                        onClick={() => onChange(active ? 'all' : status)}
                        className={chipClass(
                            active,
                            cn(meta.className, 'border-transparent'),
                        )}
                    >
                        {meta.label}
                        <span className="rounded-full bg-black/10 px-1.5 dark:bg-white/15">
                            {counts[status]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

function UserDashboard({ bookings }: { bookings: BookingRow[] }) {
    const [toCancel, setToCancel] = useState<BookingRow | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

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

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return bookings.filter((booking) => {
            const matchesStatus =
                statusFilter === 'all' || booking.status === statusFilter;
            const matchesSearch =
                query === '' ||
                booking.reference_code.toLowerCase().includes(query) ||
                booking.court_name.toLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [bookings, statusFilter, search]);

    return (
        <>
            <div className="rounded-2xl border bg-card shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b p-6">
                    <div>
                        <h2 className="text-lg font-semibold">My Bookings</h2>
                        <p className="text-sm text-muted-foreground">
                            Track and manage your court reservations
                        </p>
                    </div>
                    <Button asChild size="sm">
                        <Link href={browseCourts()}>
                            <Plus />
                            Book a court
                        </Link>
                    </Button>
                </div>

                {bookings.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <CalendarDays className="size-6" />
                        </span>
                        <p className="font-medium">No bookings yet</p>
                        <Button asChild size="sm">
                            <Link href={browseCourts()}>Browse courts</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-3 border-b p-4">
                            <StatusChips
                                bookings={bookings}
                                statusFilter={statusFilter}
                                onChange={setStatusFilter}
                            />
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search by reference or court…"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-14 text-center">
                                <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                    <Search className="size-6" />
                                </span>
                                <p className="font-medium">
                                    No bookings match your filters
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setStatusFilter('all');
                                        setSearch('');
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {filtered.map((booking) => {
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
                                                {(booking.status ===
                                                    'cancelled' ||
                                                    booking.status ===
                                                        'rejected') &&
                                                    booking.notes && (
                                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                            Reason:{' '}
                                                            {booking.notes}
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
                    </>
                )}
            </div>

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

export default function Dashboard({ bookings, admin }: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth.user?.role === 'admin';

    return (
        <>
            <Head title="Dashboard" />
            {isAdmin && admin ? (
                <div className="flex flex-1 flex-col gap-6 p-4">
                    <AdminDashboard admin={admin} />
                </div>
            ) : (
                <UserDashboard bookings={bookings ?? []} />
            )}
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
