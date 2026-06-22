import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarCheck,
    LandPlot,
    MapPin,
    ShieldCheck,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import CourtController from '@/actions/App/Http/Controllers/CourtController';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatPeso } from '@/lib/utils';
import { register } from '@/routes';
import type { Auth, Court } from '@/types';

function galleryFor(court: Court): string[] {
    return [
        court.image_url,
        ...(court.images ?? []).map((image) => image.image_url),
    ].filter((url): url is string => Boolean(url));
}

type WelcomeProps = {
    courts: Court[];
    venueName: string;
};

const features = [
    {
        icon: CalendarCheck,
        title: 'Instant booking',
        description: 'Pick a court and a time slot in just a few taps.',
    },
    {
        icon: ShieldCheck,
        title: 'Reserved & secured',
        description: 'Your slot is held while you complete payment.',
    },
    {
        icon: Wallet,
        title: 'Pay on-site',
        description: 'Scan to pay via GCash or Maya — no card needed.',
    },
];

export default function Welcome({ courts, venueName }: WelcomeProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [activeImage, setActiveImage] = useState(0);

    function openCourt(court: Court) {
        setActiveImage(0);
        setSelectedCourt(court);
    }

    const selectedGallery = selectedCourt ? galleryFor(selectedCourt) : [];

    return (
        <>
            <Head title={`${venueName} — Book a pickleball court`} />

            <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-neutral-900 dark:from-emerald-950/40 dark:via-neutral-950 dark:to-neutral-950 dark:text-neutral-100">
                <SiteHeader />

                <main>
                    {/* Hero */}
                    <section className="mx-auto w-full max-w-6xl px-6 pt-12 pb-16 text-center lg:pt-20">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                            🏓 Pickleball booking made simple
                        </span>

                        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                            Book your next{' '}
                            <span className="text-emerald-600 dark:text-emerald-400">
                                pickleball
                            </span>{' '}
                            game in seconds
                        </h1>

                        <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-600 dark:text-neutral-300">
                            Browse available courts, pick a time that works, and
                            reserve your spot. Quick, easy, and made for players.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <a
                                href="#courts"
                                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                            >
                                Browse courts
                                <ArrowRight className="size-4" />
                            </a>
                            {!auth.user && (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
                                >
                                    Create an account
                                </Link>
                            )}
                        </div>

                        {/* Feature strip */}
                        <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border border-neutral-200 bg-white/70 p-5 text-left shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60"
                                >
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        <feature.icon className="size-5" />
                                    </span>
                                    <h3 className="mt-3 font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Courts */}
                    <section
                        id="courts"
                        className="mx-auto w-full max-w-6xl scroll-mt-8 px-6 pb-20"
                    >
                        <div className="mb-8 flex flex-col items-center text-center">
                            <h2 className="text-3xl font-bold tracking-tight">
                                Our courts
                            </h2>
                            <p className="mt-2 max-w-md text-neutral-600 dark:text-neutral-400">
                                Choose from our available courts and book your
                                preferred time slot.
                            </p>
                        </div>

                        {courts.length === 0 ? (
                            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900/40">
                                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    <LandPlot className="size-6" />
                                </span>
                                <p className="mt-4 font-medium">
                                    No courts available yet
                                </p>
                                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                    Please check back soon — new courts are on
                                    the way.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                                                    {(court.images?.length ?? 0) +
                                                        1}{' '}
                                                    photos
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
                                                        {formatPeso(
                                                            court.price_per_hour,
                                                        )}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={CourtController.show(
                                                        court.id,
                                                    )}
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
                    </section>
                </main>

                <footer className="border-t border-neutral-200 dark:border-neutral-800">
                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-neutral-500 sm:flex-row dark:text-neutral-400">
                        <p>
                            © {new Date().getFullYear()} {venueName}. All rights
                            reserved.
                        </p>
                        <p>Book. Play. Repeat. 🏓</p>
                    </div>
                </footer>
            </div>

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
                                            {selectedGallery.map((url, index) => (
                                                <button
                                                    key={url}
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveImage(index)
                                                    }
                                                    className={`size-16 overflow-hidden rounded-lg border-2 transition-colors ${
                                                        index === activeImage
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
                                            ))}
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
