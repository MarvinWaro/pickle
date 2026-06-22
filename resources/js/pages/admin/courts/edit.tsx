import { Head, setLayoutProps } from '@inertiajs/react';
import { CourtForm } from '@/components/court-form';
import Heading from '@/components/heading';
import { edit, index } from '@/routes/admin/courts';
import type { Court } from '@/types';

type EditCourtProps = {
    court: Court;
    amenitySuggestions: string[];
};

export default function EditCourt({
    court,
    amenitySuggestions,
}: EditCourtProps) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Courts', href: index() },
            { title: court.name, href: edit(court.id) },
        ],
    });

    return (
        <>
            <Head title={`Edit ${court.name}`} />

            <div className="space-y-6 p-4">
                <Heading
                    title={`Edit ${court.name}`}
                    description="Update this court's details, pricing, amenities, and image."
                />

                <CourtForm
                    court={court}
                    amenitySuggestions={amenitySuggestions}
                />
            </div>
        </>
    );
}
