import { usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import UserLayout from '@/layouts/app/user-layout';
import type { Auth, BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAdmin = auth.user?.role === 'admin';

    if (isAdmin) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                {children}
            </AppSidebarLayout>
        );
    }

    return <UserLayout>{children}</UserLayout>;
}
