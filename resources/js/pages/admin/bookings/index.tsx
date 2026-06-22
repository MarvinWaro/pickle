import { Head, Link, router } from '@inertiajs/react';
import { Ban, Check, ImageIcon, ImageOff, X } from 'lucide-react';
import { useState } from 'react';
import {
    cancel,
    confirm,
    index as bookingsIndex,
    reject,
} from '@/actions/App/Http/Controllers/Admin/BookingController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { statusMetaFor } from '@/lib/booking-status';
import { cn, formatBookingDate, formatPeso } from '@/lib/utils';

type BookingRow = {
    id: string;
    reference_code: string;
    customer_name: string;
    guest_phone: string | null;
    is_guest: boolean;
    court_name: string;
    booking_date: string;
    slots: string[];
    amount: number | string;
    status: string;
    proof_url: string | null;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type BookingsIndexProps = {
    bookings: Paginated<BookingRow>;
    filters: { status: string | null };
    statusCounts: Record<string, number>;
};

const tabs: { label: string; value: string | undefined }[] = [
    { label: 'All', value: undefined },
    { label: 'Awaiting', value: 'awaiting_confirmation' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Pending', value: 'pending_payment' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Expired', value: 'expired' },
];

export default function BookingsIndex({
    bookings,
    filters,
    statusCounts,
}: BookingsIndexProps) {
    const [actionTarget, setActionTarget] = useState<{
        booking: BookingRow;
        mode: 'reject' | 'cancel';
    } | null>(null);
    const [reason, setReason] = useState('');
    const [working, setWorking] = useState(false);
    const [proofUrl, setProofUrl] = useState<string | null>(null);

    function confirmBooking(booking: BookingRow) {
        router.post(
            confirm(booking.id).url,
            {},
            {
                preserveScroll: true,
                onStart: () => setWorking(true),
                onFinish: () => setWorking(false),
            },
        );
    }

    function submitAction() {
        if (!actionTarget) {
            return;
        }

        const action = actionTarget.mode === 'reject' ? reject : cancel;

        router.post(
            action(actionTarget.booking.id).url,
            { reason },
            {
                preserveScroll: true,
                onStart: () => setWorking(true),
                onFinish: () => setWorking(false),
                onSuccess: () => {
                    setActionTarget(null);
                    setReason('');
                },
            },
        );
    }

    return (
        <>
            <Head title="Bookings" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Bookings"
                    description="Review payments and confirm or reject bookings."
                />

                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const isActive =
                            (filters.status ?? undefined) === tab.value;
                        const count = tab.value
                            ? (statusCounts[tab.value] ?? 0)
                            : undefined;

                        return (
                            <Link
                                key={tab.label}
                                href={
                                    tab.value
                                        ? bookingsIndex({
                                              query: { status: tab.value },
                                          })
                                        : bookingsIndex()
                                }
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border border-input hover:bg-accent',
                                )}
                            >
                                {tab.label}
                                {count ? (
                                    <span
                                        className={cn(
                                            'rounded-full px-1.5 text-xs',
                                            isActive
                                                ? 'bg-primary-foreground/20'
                                                : 'bg-muted',
                                        )}
                                    >
                                        {count}
                                    </span>
                                ) : null}
                            </Link>
                        );
                    })}
                </div>

                {bookings.data.length === 0 ? (
                    <Card className="py-16 text-center text-sm text-muted-foreground">
                        No bookings here yet.
                    </Card>
                ) : (
                    <Card className="overflow-hidden py-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Court &amp; schedule
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {bookings.data.map((booking) => {
                                        const meta = statusMetaFor(
                                            booking.status,
                                        );

                                        return (
                                            <tr
                                                key={booking.id}
                                                className="hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">
                                                        {booking.customer_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {booking.is_guest
                                                            ? (booking.guest_phone ??
                                                              'Guest')
                                                            : 'Account'}
                                                    </p>
                                                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                        {booking.reference_code}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">
                                                        {booking.court_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatBookingDate(
                                                            booking.booking_date,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {booking.slots.join(
                                                            ', ',
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 font-semibold whitespace-nowrap">
                                                    {formatPeso(booking.amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col items-start gap-1.5">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
                                                        >
                                                            {meta.label}
                                                        </span>
                                                        {booking.proof_url ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setProofUrl(
                                                                        booking.proof_url,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                                                            >
                                                                <ImageIcon className="size-3" />
                                                                View proof
                                                            </button>
                                                        ) : (
                                                            (booking.status ===
                                                                'awaiting_confirmation' ||
                                                                booking.status ===
                                                                    'confirmed') && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <ImageOff className="size-3" />
                                                                    No proof
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {booking.status ===
                                                            'awaiting_confirmation' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        confirmBooking(
                                                                            booking,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        working
                                                                    }
                                                                >
                                                                    <Check />
                                                                    Confirm
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        setActionTarget(
                                                                            {
                                                                                booking,
                                                                                mode: 'reject',
                                                                            },
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        working
                                                                    }
                                                                >
                                                                    <X />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {booking.status ===
                                                            'confirmed' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setActionTarget(
                                                                        {
                                                                            booking,
                                                                            mode: 'cancel',
                                                                        },
                                                                    )
                                                                }
                                                                disabled={
                                                                    working
                                                                }
                                                            >
                                                                <Ban />
                                                                Cancel
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {bookings.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Showing {bookings.from}–{bookings.to} of{' '}
                            {bookings.total}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                asChild={!!bookings.prev_page_url}
                                variant="outline"
                                size="sm"
                                disabled={!bookings.prev_page_url}
                            >
                                {bookings.prev_page_url ? (
                                    <Link
                                        href={bookings.prev_page_url}
                                        preserveScroll
                                    >
                                        Previous
                                    </Link>
                                ) : (
                                    <span>Previous</span>
                                )}
                            </Button>
                            <Button
                                asChild={!!bookings.next_page_url}
                                variant="outline"
                                size="sm"
                                disabled={!bookings.next_page_url}
                            >
                                {bookings.next_page_url ? (
                                    <Link
                                        href={bookings.next_page_url}
                                        preserveScroll
                                    >
                                        Next
                                    </Link>
                                ) : (
                                    <span>Next</span>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reject / cancel dialog */}
            <Dialog
                open={actionTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActionTarget(null);
                        setReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionTarget?.mode === 'cancel'
                                ? 'Cancel booking'
                                : 'Reject booking'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionTarget?.mode === 'cancel'
                                ? 'Cancel '
                                : 'Reject '}
                            <span className="font-medium text-foreground">
                                {actionTarget?.booking.reference_code}
                            </span>
                            ? The slot is released back to everyone. You can add
                            an optional reason.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Reason (optional) — e.g. payment not received"
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setActionTarget(null)}
                            disabled={working}
                        >
                            Keep booking
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={submitAction}
                            disabled={working}
                        >
                            {working
                                ? 'Working…'
                                : actionTarget?.mode === 'cancel'
                                  ? 'Cancel booking'
                                  : 'Reject booking'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Proof viewer */}
            <Dialog
                open={proofUrl !== null}
                onOpenChange={(open) => !open && setProofUrl(null)}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Payment proof</DialogTitle>
                    </DialogHeader>
                    {proofUrl && (
                        <img
                            src={proofUrl}
                            alt="Payment proof"
                            className="max-h-[70vh] w-full rounded-lg object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

BookingsIndex.layout = {
    breadcrumbs: [{ title: 'Bookings', href: bookingsIndex() }],
};
