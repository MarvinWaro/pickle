import { Link, usePage } from '@inertiajs/react';
import { LandPlot, Search } from 'lucide-react';
import { find as findBooking } from '@/actions/App/Http/Controllers/BookingController';
import { dashboard, login, register } from '@/routes';
import type { Auth } from '@/types';

export function SiteHeader() {
    const { auth, venueName } = usePage<{
        auth: Auth;
        venueName: string;
    }>().props;

    return (
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <LandPlot className="size-5" />
                </span>
                <span className="text-lg">{venueName}</span>
            </Link>

            <nav className="flex items-center gap-1 text-sm sm:gap-2">
                <Link
                    href={findBooking()}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-medium text-neutral-700 transition-colors hover:bg-emerald-100/60 dark:text-neutral-200 dark:hover:bg-emerald-900/30"
                >
                    <Search className="size-4" />
                    <span className="hidden sm:inline">Find booking</span>
                </Link>
                {auth.user ? (
                    <Link
                        href={dashboard()}
                        className="rounded-full bg-emerald-600 px-5 py-2 font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                        Dashboard
                    </Link>
                ) : (
                    <>
                        <Link
                            href={login()}
                            className="rounded-full px-5 py-2 font-medium text-neutral-700 transition-colors hover:bg-emerald-100/60 dark:text-neutral-200 dark:hover:bg-emerald-900/30"
                        >
                            Log in
                        </Link>
                        <Link
                            href={register()}
                            className="rounded-full bg-emerald-600 px-5 py-2 font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                            Register
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
