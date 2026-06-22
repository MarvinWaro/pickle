import { Head, router, useForm } from '@inertiajs/react';
import { CalendarOff, Plus, Trash2 } from 'lucide-react';
import {
    destroy,
    edit,
    store,
} from '@/actions/App/Http/Controllers/Settings/ScheduleSettingsController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBookingDate } from '@/lib/utils';

type ClosedDate = {
    id: string;
    date: string;
    reason: string | null;
};

type ScheduleProps = {
    closedDates: ClosedDate[];
};

export default function Schedule({ closedDates }: ScheduleProps) {
    const form = useForm({ date: '', reason: '' });

    function addClosedDate(event: React.FormEvent) {
        event.preventDefault();
        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    function removeClosedDate(id: string) {
        router.delete(destroy(id).url, { preserveScroll: true });
    }

    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title="Closed dates" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Closed dates"
                    description="Mark days off or holidays — players can't book on a closed date."
                />

                <form
                    onSubmit={addClosedDate}
                    className="flex flex-wrap items-end gap-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            min={today}
                            value={form.data.date}
                            onChange={(event) =>
                                form.setData('date', event.target.value)
                            }
                            required
                            className="w-44"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Input
                            id="reason"
                            value={form.data.reason}
                            onChange={(event) =>
                                form.setData('reason', event.target.value)
                            }
                            placeholder="e.g. Holiday, Maintenance"
                            className="w-56"
                        />
                    </div>
                    <Button type="submit" disabled={form.processing}>
                        <Plus />
                        Close this day
                    </Button>
                </form>
                <InputError
                    message={form.errors.date ?? form.errors.reason}
                />

                <div className="rounded-xl border">
                    {closedDates.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                            <CalendarOff className="size-6" />
                            <p className="text-sm">
                                No closed dates — the venue is open every day.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {closedDates.map((closed) => (
                                <li
                                    key={closed.id}
                                    className="flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {formatBookingDate(closed.date)}
                                        </p>
                                        {closed.reason && (
                                            <p className="text-sm text-muted-foreground">
                                                {closed.reason}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            removeClosedDate(closed.id)
                                        }
                                        aria-label="Reopen this day"
                                    >
                                        <Trash2 className="text-destructive" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}

Schedule.layout = {
    breadcrumbs: [{ title: 'Closed dates', href: edit() }],
};
