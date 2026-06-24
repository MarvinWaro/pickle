import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarCheck, ShieldCheck, Wallet } from 'lucide-react';
import { CourtGrid } from '@/components/court-grid';
import { SiteHeader } from '@/components/site-header';
import { register } from '@/routes';
import type { Auth, Court } from '@/types';

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
                            reserve your spot. Quick, easy, and made for
                            players.
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

                        <CourtGrid courts={courts} />
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
        </>
    );
}
