import { Link, router } from '@inertiajs/react';
import { CalendarDays, LandPlot, LogOut, Settings, User } from 'lucide-react';
import type { ComponentType } from 'react';
import { index as browseCourts } from '@/actions/App/Http/Controllers/CourtController';
import { ProfileSummary } from '@/components/profile-rail';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { dashboard, logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';

type Tab = {
    title: string;
    href: ReturnType<typeof dashboard>;
    icon: ComponentType<{ className?: string }>;
};

const tabClass =
    'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors touch-manipulation select-none';

export function MobileBottomNav() {
    const { isCurrentUrl } = useCurrentUrl();

    const tabs: Tab[] = [
        { title: 'Bookings', href: dashboard(), icon: CalendarDays },
        { title: 'Courts', href: browseCourts(), icon: LandPlot },
    ];

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mx-auto flex max-w-md items-stretch">
                {tabs.map((tab) => {
                    const active = isCurrentUrl(tab.href);
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.title}
                            href={tab.href}
                            prefetch
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                tabClass,
                                active
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-neutral-500 dark:text-neutral-400',
                            )}
                        >
                            <Icon className="size-5" />
                            {tab.title}
                        </Link>
                    );
                })}

                <Sheet>
                    <SheetTrigger
                        className={cn(
                            tabClass,
                            'text-neutral-500 dark:text-neutral-400',
                        )}
                    >
                        <User className="size-5" />
                        Profile
                    </SheetTrigger>
                    <SheetContent
                        side="bottom"
                        className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-2xl"
                    >
                        <SheetHeader>
                            <SheetTitle>Profile</SheetTitle>
                        </SheetHeader>

                        <div className="space-y-4 p-4 pt-0">
                            <ProfileSummary />

                            <div className="overflow-hidden rounded-2xl border bg-card">
                                <SheetClose asChild>
                                    <Link
                                        href={editProfile()}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                                    >
                                        <Settings className="size-4 text-muted-foreground" />
                                        Settings
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link
                                        href={logout()}
                                        as="button"
                                        onClick={() => router.flushAll()}
                                        className="flex w-full items-center gap-3 border-t px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-muted dark:text-red-400"
                                        data-test="logout-button"
                                    >
                                        <LogOut className="size-4" />
                                        Log out
                                    </Link>
                                </SheetClose>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
