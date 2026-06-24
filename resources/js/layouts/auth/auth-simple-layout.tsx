import { Link, usePage } from '@inertiajs/react';
import { LandPlot } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { venueName } = usePage<{ venueName?: string }>().props;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b from-emerald-50 via-white to-white p-6 text-neutral-900 md:p-10 dark:from-emerald-950/40 dark:via-neutral-950 dark:to-neutral-950 dark:text-neutral-100">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Link
                        href={home()}
                        className="flex flex-col items-center gap-3 font-medium"
                    >
                        <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                            <LandPlot className="size-6" />
                        </span>
                        {venueName && (
                            <span className="text-lg font-semibold">
                                {venueName}
                            </span>
                        )}
                        <span className="sr-only">{title}</span>
                    </Link>

                    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/70">
                        <div className="mb-6 space-y-2 text-center">
                            <h1 className="text-xl font-semibold tracking-tight">
                                {title}
                            </h1>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {description}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
