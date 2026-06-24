import { Head } from '@inertiajs/react';
import { CourtGrid } from '@/components/court-grid';
import type { Court } from '@/types';

type CourtsIndexProps = {
    courts: Court[];
    venueName: string;
};

export default function CourtsIndex({ courts }: CourtsIndexProps) {
    return (
        <>
            <Head title="Courts" />

            <div className="rounded-2xl border bg-card shadow-sm">
                <div className="border-b p-6">
                    <h2 className="text-lg font-semibold">Browse courts</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose a court and book your preferred time slot.
                    </p>
                </div>
                <div className="p-4 sm:p-6">
                    <CourtGrid courts={courts} columns={2} />
                </div>
            </div>
        </>
    );
}
