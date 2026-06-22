import { Head, Link, useForm, usePoll } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    MessageCircle,
    QrCode,
    TimerOff,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { paid as markBookingPaid } from '@/actions/App/Http/Controllers/BookingController';
import InputError from '@/components/input-error';
import { SiteHeader } from '@/components/site-header';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBookingDate, formatPeso } from '@/lib/utils';
import { home } from '@/routes';

type Booking = {
    reference_code: string;
    status: string;
    amount: number | string;
    booking_date: string;
    court_name: string;
    slots: string[];
    expires_at: string | null;
    notes: string | null;
};

type Payment = {
    method: string | null;
    account_name: string | null;
    account_number: string | null;
    instructions: string | null;
    messenger_link: string | null;
};

type PayProps = {
    booking: Booking;
    qrUrl: string | null;
    payment: Payment;
};

function secondsUntil(expiresAt: string | null): number {
    if (!expiresAt) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
    );
}

function StatusPanel({
    icon,
    tone,
    title,
    description,
}: {
    icon: React.ReactNode;
    tone: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className={`flex size-14 items-center justify-center rounded-full ${tone}`}>
                {icon}
            </span>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
                {description}
            </p>
        </div>
    );
}

export default function BookingPay({ booking, qrUrl, payment }: PayProps) {
    const [secondsLeft, setSecondsLeft] = useState(() =>
        secondsUntil(booking.expires_at),
    );
    const [qrOpen, setQrOpen] = useState(false);
    const paidForm = useForm<{ payment_proof: File | null }>({
        payment_proof: null,
    });

    // While the booking is still in flight, quietly poll so the page flips to
    // "Confirmed" (or "Expired") on its own — no manual refresh needed.
    const isLive =
        booking.status === 'pending_payment' ||
        booking.status === 'awaiting_confirmation';
    const { start, stop } = usePoll(
        10000,
        { only: ['booking'] },
        { autoStart: false },
    );
    useEffect(() => {
        if (isLive) {
            start();
        } else {
            stop();
        }

        return () => stop();
    }, [isLive, start, stop]);

    useEffect(() => {
        if (booking.status !== 'pending_payment') {
            return;
        }

        const id = setInterval(
            () => setSecondsLeft(secondsUntil(booking.expires_at)),
            1000,
        );

        return () => clearInterval(id);
    }, [booking.status, booking.expires_at]);

    const isExpired =
        booking.status === 'expired' ||
        (booking.status === 'pending_payment' && secondsLeft <= 0);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    function submitPaid(event: React.FormEvent) {
        event.preventDefault();
        paidForm.post(markBookingPaid(booking.reference_code).url, {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`Booking ${booking.reference_code}`} />

            <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-neutral-900 dark:from-emerald-950/40 dark:via-neutral-950 dark:to-neutral-950 dark:text-neutral-100">
                <SiteHeader />

                <main className="mx-auto w-full max-w-lg px-6 pb-20">
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/60">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Reference
                            </p>
                            <p className="font-mono text-lg font-semibold">
                                {booking.reference_code}
                            </p>
                        </div>

                        <div className="space-y-1 px-6 py-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">
                                    Court
                                </span>
                                <span className="font-medium">
                                    {booking.court_name}
                                </span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-neutral-500 dark:text-neutral-400">
                                    Schedule
                                </span>
                                <span className="text-right font-medium">
                                    {formatBookingDate(booking.booking_date)}
                                    {booking.slots.map((slot) => (
                                        <span
                                            key={slot}
                                            className="block text-neutral-500 dark:text-neutral-400"
                                        >
                                            {slot}
                                        </span>
                                    ))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500 dark:text-neutral-400">
                                    Amount
                                </span>
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {formatPeso(booking.amount)}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 px-6 py-5 dark:border-neutral-800">
                            {booking.status === 'confirmed' && (
                                <StatusPanel
                                    tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                    icon={<CheckCircle2 className="size-7" />}
                                    title="Booking confirmed!"
                                    description="Your payment has been verified. See you on the court!"
                                />
                            )}

                            {booking.status === 'awaiting_confirmation' && (
                                <StatusPanel
                                    tone="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                    icon={<Clock className="size-7" />}
                                    title="Waiting for the venue to confirm"
                                    description="We've received your payment and your slot is reserved for you. It's not final until the venue confirms — this page updates on its own once they do."
                                />
                            )}

                            {booking.status === 'rejected' && (
                                <StatusPanel
                                    tone="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                    icon={<XCircle className="size-7" />}
                                    title="Payment rejected"
                                    description="The venue could not verify this payment. Please contact them or try booking again."
                                />
                            )}

                            {booking.status === 'cancelled' && (
                                <StatusPanel
                                    tone="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                                    icon={<XCircle className="size-7" />}
                                    title="Booking cancelled"
                                    description="This booking has been cancelled. You're welcome to book another date."
                                />
                            )}

                            {(booking.status === 'rejected' ||
                                booking.status === 'cancelled') &&
                                booking.notes && (
                                    <div className="rounded-xl bg-neutral-50 px-4 py-3 text-center text-sm dark:bg-neutral-900/60">
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                            Reason from the venue:{' '}
                                        </span>
                                        <span className="font-medium">
                                            {booking.notes}
                                        </span>
                                    </div>
                                )}

                            {(booking.status === 'expired' ||
                                (booking.status === 'pending_payment' &&
                                    isExpired)) && (
                                <StatusPanel
                                    tone="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                                    icon={<TimerOff className="size-7" />}
                                    title="This hold expired"
                                    description="The slot has been released back to everyone. Please start a new booking."
                                />
                            )}

                            {booking.status === 'pending_payment' &&
                                !isExpired && (
                                    <div className="space-y-5">
                                        <div className="rounded-xl bg-emerald-50 py-3 text-center dark:bg-emerald-950/40">
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                                Slot held — pay within
                                            </p>
                                            <p className="font-mono text-3xl font-bold text-emerald-700 tabular-nums dark:text-emerald-300">
                                                {String(minutes).padStart(2, '0')}
                                                :
                                                {String(seconds).padStart(2, '0')}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center gap-3">
                                            {qrUrl ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setQrOpen(true)
                                                    }
                                                    className="group relative cursor-zoom-in"
                                                    title="Tap to enlarge"
                                                >
                                                    <img
                                                        src={qrUrl}
                                                        alt="Payment QR code"
                                                        className="size-56 rounded-xl border object-contain p-2 transition-opacity group-hover:opacity-90"
                                                    />
                                                    <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                                                        Tap to enlarge
                                                    </span>
                                                </button>
                                            ) : (
                                                <div className="flex size-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-neutral-400">
                                                    <QrCode className="size-10" />
                                                    <span className="text-xs">
                                                        No QR uploaded yet
                                                    </span>
                                                </div>
                                            )}

                                            {(payment.method ||
                                                payment.account_name ||
                                                payment.account_number) && (
                                                <div className="w-full rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-900/60">
                                                    {payment.method && (
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-500 dark:text-neutral-400">
                                                                Method
                                                            </span>
                                                            <span className="font-medium">
                                                                {payment.method}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {payment.account_name && (
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-500 dark:text-neutral-400">
                                                                Name
                                                            </span>
                                                            <span className="font-medium">
                                                                {
                                                                    payment.account_name
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    {payment.account_number && (
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-500 dark:text-neutral-400">
                                                                Number
                                                            </span>
                                                            <span className="font-mono font-medium">
                                                                {
                                                                    payment.account_number
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {payment.instructions && (
                                                <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                                                    {payment.instructions}
                                                </p>
                                            )}

                                            {payment.messenger_link && (
                                                <a
                                                    href={payment.messenger_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0084FF] px-5 py-3 font-medium text-white transition-opacity hover:opacity-90"
                                                >
                                                    <MessageCircle className="size-4" />
                                                    Send proof on Messenger
                                                </a>
                                            )}
                                        </div>

                                        <form
                                            onSubmit={submitPaid}
                                            className="space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800"
                                        >
                                            <div className="grid gap-2">
                                                <Label htmlFor="payment_proof">
                                                    Payment proof (optional)
                                                </Label>
                                                <Input
                                                    id="payment_proof"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(event) =>
                                                        paidForm.setData(
                                                            'payment_proof',
                                                            event.target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        paidForm.errors
                                                            .payment_proof
                                                    }
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={paidForm.processing}
                                                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {paidForm.processing
                                                    ? 'Submitting…'
                                                    : "I've paid"}
                                            </button>
                                        </form>
                                    </div>
                                )}
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href={home()}
                            className="text-sm text-emerald-600 hover:underline dark:text-emerald-400"
                        >
                            ← Back to courts
                        </Link>
                    </div>
                </main>
            </div>

            <Dialog open={qrOpen} onOpenChange={setQrOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle className="sr-only">
                        Payment QR code
                    </DialogTitle>
                    {qrUrl && (
                        <img
                            src={qrUrl}
                            alt="Payment QR code"
                            className="max-h-[80vh] w-full rounded-lg object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
