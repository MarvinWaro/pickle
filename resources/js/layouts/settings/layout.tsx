import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { edit as editPayment } from '@/actions/App/Http/Controllers/Settings/PaymentSettingsController';
import { edit as editSchedule } from '@/actions/App/Http/Controllers/Settings/ScheduleSettingsController';
import { edit as editBranding } from '@/actions/App/Http/Controllers/Settings/VenueSettingsController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { Auth, NavItem } from '@/types';

type NavGroup = {
    label: string;
    adminOnly?: boolean;
    items: NavItem[];
};

const navGroups: NavGroup[] = [
    {
        label: 'Account',
        items: [
            { title: 'Profile', href: edit(), icon: null },
            { title: 'Security', href: editSecurity(), icon: null },
            { title: 'Appearance', href: editAppearance(), icon: null },
        ],
    },
    {
        label: 'Venue',
        adminOnly: true,
        items: [
            { title: 'Branding', href: editBranding(), icon: null },
            { title: 'Payment', href: editPayment(), icon: null },
            { title: 'Closed dates', href: editSchedule(), icon: null },
        ],
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth.user?.role === 'admin';

    const visibleGroups = navGroups.filter(
        (group) => !group.adminOnly || isAdmin,
    );

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your account and venue settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-56">
                    <nav className="flex flex-col gap-4" aria-label="Settings">
                        {visibleGroups.map((group) => (
                            <div key={group.label} className="flex flex-col">
                                <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    {group.label}
                                </p>
                                {group.items.map((item, index) => (
                                    <Button
                                        key={`${toUrl(item.href)}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn('w-full justify-start', {
                                            'bg-muted': isCurrentOrParentUrl(
                                                item.href,
                                            ),
                                        })}
                                    >
                                        <Link href={item.href}>
                                            {item.icon && (
                                                <item.icon className="h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
