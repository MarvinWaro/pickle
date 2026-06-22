import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

const pesoFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
});

/**
 * Format a numeric value as Philippine Peso (e.g. ₱1,234.00).
 */
export function formatPeso(value: number | string): string {
    const amount = typeof value === 'string' ? Number(value) : value;

    return pesoFormatter.format(Number.isFinite(amount) ? amount : 0);
}

/**
 * Format a `YYYY-MM-DD` booking date as a friendly, relative label —
 * e.g. "Today · Mon, Jun 15", "Tomorrow · Tue, Jun 16", or "Mon, Jun 15, 2026".
 */
export function formatBookingDate(date: string): string {
    const target = new Date(`${date}T00:00:00`);

    if (Number.isNaN(target.getTime())) {
        return date;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
        (target.getTime() - today.getTime()) / 86_400_000,
    );

    const weekday = target.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    if (diffDays === 0) {
        return `Today · ${weekday}`;
    }

    if (diffDays === 1) {
        return `Tomorrow · ${weekday}`;
    }

    return target.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
