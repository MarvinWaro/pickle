import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LandPlot } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { index as browseCourts } from '@/actions/App/Http/Controllers/CourtController';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { ProfileRail } from '@/components/profile-rail';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import type { Auth, User } from '@/types';

function UserMenu({ user }: { user: User }) {
    const getInitials = useInitials();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    data-test="user-menu-trigger"
                >
                    <Avatar className="size-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="max-w-32 truncate text-sm font-medium">
                        {user.name}
                    </span>
                    <ChevronDown className="size-4 text-neutral-500" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-lg">
                <UserMenuContent user={user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function UserLayout({ children }: PropsWithChildren) {
    const { auth, venueName } = usePage<{
        auth: Auth;
        venueName?: string;
    }>().props;
    const { isCurrentUrl } = useCurrentUrl();

    // The profile rail is the persistent desktop shell for the player's own
    // area; other pages (e.g. settings) render full-width. On mobile the rail
    // is hidden in favour of a content-first layout + bottom tab bar.
    const showRail = isCurrentUrl(dashboard()) || isCurrentUrl(browseCourts());

    return (
        <div className="min-h-svh bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
            <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 px-4">
                    <Link
                        href={dashboard()}
                        className="flex shrink-0 items-center gap-2 font-semibold"
                    >
                        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                            <LandPlot className="size-5" />
                        </span>
                        <span className="truncate text-base">{venueName}</span>
                    </Link>

                    {/* Account menu lives in the bottom-nav Profile tab on mobile. */}
                    <div className="hidden shrink-0 items-center justify-end lg:flex">
                        {auth.user && <UserMenu user={auth.user} />}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-3 pt-14 pb-24 sm:px-4 lg:pb-10">
                {showRail ? (
                    <div className="grid gap-6 pt-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
                        <aside className="hidden lg:sticky lg:top-[4.5rem] lg:block">
                            <ProfileRail />
                        </aside>
                        <div className="min-w-0">{children}</div>
                    </div>
                ) : (
                    children
                )}
            </main>

            {auth.user && <MobileBottomNav />}
        </div>
    );
}
