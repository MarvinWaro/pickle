import { Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    CalendarDays,
    Flame,
    LandPlot,
    Wallet,
} from 'lucide-react';
import { index as browseCourts } from '@/actions/App/Http/Controllers/CourtController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn, formatPeso } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { Auth, NavItem, User } from '@/types';

type PlayerStats = {
    total_spent: number;
    sessions: number;
    days_played: number;
    streak: number;
};

const EMPTY_STATS: PlayerStats = {
    total_spent: 0,
    sessions: 0,
    days_played: 0,
    streak: 0,
};

function MiniStat({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-xl border bg-muted/30 p-3">
            <span className="flex size-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {icon}
            </span>
            <p className="mt-2 text-base leading-tight font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
}

function ProfileCard({ user, stats }: { user: User; stats: PlayerStats }) {
    const getInitials = useInitials();

    return (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
                <div className="relative">
                    <Avatar className="size-20">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-emerald-100 text-xl font-semibold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="absolute right-1 bottom-1 size-4 rounded-full border-2 border-card bg-emerald-500" />
                </div>

                <p className="mt-3 text-lg font-semibold">{user.name}</p>
                <div className="mt-1 flex flex-col items-center gap-1">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Player
                    </span>
                    <span className="max-w-full truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 border-t pt-5">
                <MiniStat
                    icon={<Wallet className="size-4" />}
                    label="Total spent"
                    value={formatPeso(stats.total_spent)}
                />
                <MiniStat
                    icon={<CalendarCheck className="size-4" />}
                    label="Sessions"
                    value={stats.sessions}
                />
                <MiniStat
                    icon={<CalendarDays className="size-4" />}
                    label="Days played"
                    value={stats.days_played}
                />
                <MiniStat
                    icon={<Flame className="size-4" />}
                    label="Week streak"
                    value={stats.streak}
                />
            </div>
        </div>
    );
}

function ProfileNav() {
    const { isCurrentUrl } = useCurrentUrl();

    const items: NavItem[] = [
        { title: 'Bookings', href: dashboard(), icon: CalendarDays },
        { title: 'Browse Courts', href: browseCourts(), icon: LandPlot },
    ];

    return (
        <div className="rounded-2xl border bg-card p-2 shadow-sm">
            <p className="px-3 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Profile Navigation
            </p>
            <nav className="flex flex-col">
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            prefetch
                            className={cn(
                                'relative flex touch-manipulation items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            {active && (
                                <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r bg-emerald-600" />
                            )}
                            <span
                                className={cn(
                                    'flex size-8 items-center justify-center rounded-md',
                                    active
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {Icon && <Icon className="size-4" />}
                            </span>
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export function ProfileSummary() {
    const { auth, playerStats } = usePage<{
        auth: Auth;
        playerStats?: PlayerStats | null;
    }>().props;

    if (!auth.user) {
        return null;
    }

    return <ProfileCard user={auth.user} stats={playerStats ?? EMPTY_STATS} />;
}

export function ProfileRail() {
    return (
        <div className="flex flex-col gap-4">
            <ProfileSummary />
            <ProfileNav />
        </div>
    );
}
