import { Head, Link, router } from '@inertiajs/react';
import { Clock, ImageOff, LandPlot, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    create,
    destroy,
    edit,
} from '@/actions/App/Http/Controllers/Admin/CourtController';
import { index as courtSlots } from '@/actions/App/Http/Controllers/Admin/TimeSlotController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
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
import { formatPeso } from '@/lib/utils';
import { index } from '@/routes/admin/courts';
import type { Court } from '@/types';

type CourtsIndexProps = {
    courts: Court[];
};

export default function CourtsIndex({ courts }: CourtsIndexProps) {
    const [courtToDelete, setCourtToDelete] = useState<Court | null>(null);
    const [deleting, setDeleting] = useState(false);

    function confirmDelete() {
        if (!courtToDelete) {
            return;
        }

        router.delete(destroy(courtToDelete.id).url, {
            preserveScroll: true,
            onStart: () => setDeleting(true),
            onFinish: () => setDeleting(false),
            onSuccess: () => setCourtToDelete(null),
        });
    }

    return (
        <>
            <Head title="Courts" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Courts"
                        description="Manage the courts players can browse and book."
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus />
                            New court
                        </Link>
                    </Button>
                </div>

                {courts.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="rounded-full bg-muted p-3 text-muted-foreground">
                            <LandPlot className="size-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">No courts yet</p>
                            <p className="text-sm text-muted-foreground">
                                Add your first court to start accepting
                                bookings.
                            </p>
                        </div>
                        <Button asChild className="mt-2">
                            <Link href={create()}>
                                <Plus />
                                New court
                            </Link>
                        </Button>
                    </Card>
                ) : (
                    <Card className="overflow-hidden py-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Court
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Price / hr
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Amenities
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
                                    {courts.map((court) => (
                                        <tr
                                            key={court.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                                        {court.image_url ? (
                                                            <img
                                                                src={
                                                                    court.image_url
                                                                }
                                                                alt={court.name}
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageOff className="size-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {court.name}
                                                        </p>
                                                        {court.surface && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {court.surface}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatPeso(
                                                    court.price_per_hour,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {court.amenities &&
                                                court.amenities.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {court.amenities.map(
                                                            (amenity) => (
                                                                <Badge
                                                                    key={
                                                                        amenity.id
                                                                    }
                                                                    variant="secondary"
                                                                >
                                                                    {
                                                                        amenity.name
                                                                    }
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        court.is_active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {court.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={courtSlots(
                                                                court.id,
                                                            )}
                                                        >
                                                            <Clock />
                                                            Slots
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={edit(
                                                                court.id,
                                                            )}
                                                        >
                                                            <Pencil />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setCourtToDelete(
                                                                court,
                                                            )
                                                        }
                                                        aria-label={`Delete ${court.name}`}
                                                    >
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            <Dialog
                open={courtToDelete !== null}
                onOpenChange={(open) => !open && setCourtToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete court</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-medium text-foreground">
                                {courtToDelete?.name}
                            </span>
                            ? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCourtToDelete(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting…' : 'Delete court'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

CourtsIndex.layout = {
    breadcrumbs: [{ title: 'Courts', href: index() }],
};
