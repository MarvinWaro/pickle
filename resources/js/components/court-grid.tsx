import { Link } from '@inertiajs/react';
import { ArrowRight, LandPlot, MapPin } from 'lucide-react';
import { useState } from 'react';
import CourtController from '@/actions/App/Http/Controllers/CourtController';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatPeso } from '@/lib/utils';
import type { Court } from '@/types';

function galleryFor(court: Court): string[] {
    return [
        court.image_url,
        ...(court.images ?? []).map((image) => image.image_url),
    ].filter((url): url is string => Boolean(url));
}

type Props = {
    courts: Court[];
    columns?: 2 | 3;
};

export function CourtGrid({ courts, columns = 3 }: Props) {
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [activeImage, setActiveImage] = useState(0);

    function openCourt(court: Court) {
        setActiveImage(0);
        setSelectedCourt(court);
    }

    const selectedGallery = selectedCourt ? galleryFor(selectedCourt) : [];

    const gridClass =
        columns === 2
            ? 'grid gap-6 sm:grid-cols-2'
            : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';

    return (
        <>
            {courts.length === 0 ? (
                <div className="mx-auto max-w-md rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <LandPlot className="size-6" />
                    </span>
                    <p className="mt-4 font-medium">No courts available yet</p>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        Please check back soon — new courts are on the way.
                    </p>
                </div>
            ) : (
                <div className={gridClass}>
                    {courts.map((court) => (
                        <article
                            key={court.id}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <button
                                type="button"
                                onClick={() => openCourt(court)}
                                className="relative aspect-video cursor-pointer overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50 text-left dark:from-emerald-950 dark:to-neutral-900"
                            >
                                {court.image_url ? (
                                    <img
                                        src={court.image_url}
                                        alt={court.name}
                                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center text-emerald-600/60 dark:text-emerald-400/40">
                                        <LandPlot className="size-10" />
                                    </div>
                                )}
                                {court.surface && (
                                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur dark:bg-neutral-900/90 dark:text-neutral-200">
                                        <MapPin className="size-3" />
                                        {court.surface}
                                    </span>
                                )}
                                {(court.images?.length ?? 0) > 0 && (
                                    <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                                        {(court.images?.length ?? 0) + 1} photos
                                    </span>
                                )}
                            </button>

                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="text-lg font-semibold">
                                    {court.name}
                                </h3>
                                {court.description && (
                                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        {court.description}
                                    </p>
                                )}

                                {court.amenities &&
                                    court.amenities.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {court.amenities.map((amenity) => (
                                                <Badge
                                                    key={amenity.id}
                                                    variant="secondary"
                                                >
                                                    {amenity.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                <button
                                    type="button"
                                    onClick={() => openCourt(court)}
                                    className="mt-3 inline-flex w-fit items-center gap-1 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                                >
                                    View details
                                    <ArrowRight className="size-3.5" />
                                </button>

                                <div className="mt-auto flex items-end justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                    <div>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Per hour
                                        </p>
                                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatPeso(court.price_per_hour)}
                                        </p>
                                    </div>
                                    <Link
                                        href={CourtController.show(court.id)}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                    >
                                        Book now
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <Dialog
                open={selectedCourt !== null}
                onOpenChange={(open) => !open && setSelectedCourt(null)}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    {selectedCourt && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl">
                                    {selectedCourt.name}
                                </DialogTitle>
                                {selectedCourt.surface && (
                                    <DialogDescription className="flex items-center gap-1">
                                        <MapPin className="size-3.5" />
                                        {selectedCourt.surface}
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            {selectedGallery.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="aspect-video overflow-hidden rounded-xl border bg-muted">
                                        <img
                                            src={selectedGallery[activeImage]}
                                            alt={selectedCourt.name}
                                            className="size-full object-cover"
                                        />
                                    </div>
                                    {selectedGallery.length > 1 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedGallery.map(
                                                (url, index) => (
                                                    <button
                                                        key={url}
                                                        type="button"
                                                        onClick={() =>
                                                            setActiveImage(
                                                                index,
                                                            )
                                                        }
                                                        className={`size-16 overflow-hidden rounded-lg border-2 transition-colors ${
                                                            index ===
                                                            activeImage
                                                                ? 'border-emerald-600'
                                                                : 'border-transparent'
                                                        }`}
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`${selectedCourt.name} angle ${index + 1}`}
                                                            className="size-full object-cover"
                                                        />
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex aspect-video items-center justify-center rounded-xl border bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600/60 dark:from-emerald-950 dark:to-neutral-900 dark:text-emerald-400/40">
                                    <LandPlot className="size-12" />
                                </div>
                            )}

                            {selectedCourt.description && (
                                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                                    {selectedCourt.description}
                                </p>
                            )}

                            {selectedCourt.amenities &&
                                selectedCourt.amenities.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-sm font-medium">
                                            Amenities
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedCourt.amenities.map(
                                                (amenity) => (
                                                    <Badge
                                                        key={amenity.id}
                                                        variant="secondary"
                                                    >
                                                        {amenity.name}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            <div className="flex items-end justify-between border-t pt-4">
                                <div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Per hour
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatPeso(
                                            selectedCourt.price_per_hour,
                                        )}
                                    </p>
                                </div>
                                <Link
                                    href={CourtController.show(
                                        selectedCourt.id,
                                    )}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                >
                                    Book now
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
