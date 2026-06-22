import { Head } from '@inertiajs/react';
import { CourtForm } from '@/components/court-form';
import Heading from '@/components/heading';
import { create, index } from '@/routes/admin/courts';

type CreateCourtProps = {
    amenitySuggestions: string[];
};

export default function CreateCourt({ amenitySuggestions }: CreateCourtProps) {
    return (
        <>
            <Head title="New court" />

            <div className="space-y-6 p-4">
                <Heading
                    title="New court"
                    description="Add a court players can browse and book."
                />

                <CourtForm amenitySuggestions={amenitySuggestions} />
            </div>
        </>
    );
}

CreateCourt.layout = {
    breadcrumbs: [
        { title: 'Courts', href: index() },
        { title: 'New court', href: create() },
    ],
};
