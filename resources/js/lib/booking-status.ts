export type BookingStatusMeta = {
    label: string;
    className: string;
};

/**
 * Single source of truth for booking status labels and badge colors.
 */
export const bookingStatusMeta: Record<string, BookingStatusMeta> = {
    pending_payment: {
        label: 'Pending payment',
        className:
            'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    },
    awaiting_confirmation: {
        label: 'Awaiting confirmation',
        className:
            'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    },
    confirmed: {
        label: 'Confirmed',
        className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
    expired: {
        label: 'Expired',
        className:
            'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    },
    rejected: {
        label: 'Rejected',
        className:
            'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    },
    cancelled: {
        label: 'Cancelled',
        className:
            'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    },
};

export function statusMetaFor(status: string): BookingStatusMeta {
    return bookingStatusMeta[status] ?? bookingStatusMeta.cancelled;
}
