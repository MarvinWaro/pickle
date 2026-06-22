import { Head, router, setLayoutProps, useForm } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import TimeSlotController, {
    destroy,
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/TimeSlotController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPeso } from '@/lib/utils';
import { index as courtsIndex } from '@/routes/admin/courts';

type Slot = {
    id: string;
    start_time: string;
    end_time: string;
    price_per_hour: string | null;
    is_active: boolean;
    label: string;
    price: number;
};

type SlotsIndexProps = {
    court: { id: string; name: string; price_per_hour: string };
    slots: Slot[];
};

export default function SlotsIndex({ court, slots }: SlotsIndexProps) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Courts', href: courtsIndex() },
            { title: `${court.name} · Slots`, href: TimeSlotController.index(court.id) },
        ],
    });

    const addForm = useForm({
        start_time: '',
        end_time: '',
        price_per_hour: '',
        is_active: true,
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');
    const [editPrice, setEditPrice] = useState('');

    function addSlot(event: React.FormEvent) {
        event.preventDefault();
        addForm.post(store(court.id).url, {
            preserveScroll: true,
            onSuccess: () => addForm.reset(),
        });
    }

    function startEditing(slot: Slot) {
        setEditingId(slot.id);
        setEditStart(slot.start_time);
        setEditEnd(slot.end_time);
        setEditPrice(slot.price_per_hour ?? '');
    }

    function saveEdit(slot: Slot) {
        router.put(
            update({ court: court.id, slot: slot.id }).url,
            {
                start_time: editStart,
                end_time: editEnd,
                price_per_hour: editPrice,
                is_active: slot.is_active,
            },
            { preserveScroll: true, onSuccess: () => setEditingId(null) },
        );
    }

    function toggleActive(slot: Slot) {
        router.put(
            update({ court: court.id, slot: slot.id }).url,
            {
                start_time: slot.start_time,
                end_time: slot.end_time,
                is_active: !slot.is_active,
            },
            { preserveScroll: true },
        );
    }

    function removeSlot(slot: Slot) {
        router.delete(destroy({ court: court.id, slot: slot.id }).url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`${court.name} — Time slots`} />

            <div className="space-y-6 p-4">
                <Heading
                    title={`Time slots — ${court.name}`}
                    description="Daily time windows players can book. A slot is bookable on any date unless already taken."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Add a time slot</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={addSlot}
                            className="flex flex-wrap items-end gap-4"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="start_time">Start</Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={addForm.data.start_time}
                                    onChange={(event) =>
                                        addForm.setData(
                                            'start_time',
                                            event.target.value,
                                        )
                                    }
                                    required
                                    className="w-36"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_time">End</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={addForm.data.end_time}
                                    onChange={(event) =>
                                        addForm.setData(
                                            'end_time',
                                            event.target.value,
                                        )
                                    }
                                    required
                                    className="w-36"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price_per_hour">
                                    Price / hr
                                </Label>
                                <Input
                                    id="price_per_hour"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={addForm.data.price_per_hour}
                                    onChange={(event) =>
                                        addForm.setData(
                                            'price_per_hour',
                                            event.target.value,
                                        )
                                    }
                                    placeholder={`Base ${formatPeso(court.price_per_hour)}`}
                                    className="w-40"
                                />
                            </div>
                            <Button type="submit" disabled={addForm.processing}>
                                <Plus />
                                Add slot
                            </Button>
                        </form>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Leave price blank to use the court's base rate of{' '}
                            {formatPeso(court.price_per_hour)}/hr. Set a higher
                            rate for evening or peak slots.
                        </p>
                        <InputError
                            className="mt-2"
                            message={
                                addForm.errors.start_time ??
                                addForm.errors.end_time ??
                                addForm.errors.price_per_hour
                            }
                        />
                    </CardContent>
                </Card>

                <Card className="overflow-hidden py-0">
                    {slots.length === 0 ? (
                        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
                            No time slots yet. Add one above.
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Time
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {slots.map((slot) => (
                                    <tr key={slot.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            {editingId === slot.id ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        value={editStart}
                                                        onChange={(event) =>
                                                            setEditStart(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="w-32"
                                                    />
                                                    <span>–</span>
                                                    <Input
                                                        type="time"
                                                        value={editEnd}
                                                        onChange={(event) =>
                                                            setEditEnd(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="w-32"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="font-medium">
                                                    {slot.label}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {editingId === slot.id ? (
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={editPrice}
                                                    onChange={(event) =>
                                                        setEditPrice(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder={`Base ${formatPeso(court.price_per_hour)}`}
                                                    className="w-36"
                                                />
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    {formatPeso(slot.price)}
                                                    {slot.price_per_hour && (
                                                        <Badge variant="secondary">
                                                            Peak
                                                        </Badge>
                                                    )}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleActive(slot)
                                                }
                                            >
                                                <Badge
                                                    variant={
                                                        slot.is_active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {slot.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingId === slot.id ? (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                saveEdit(slot)
                                                            }
                                                            aria-label="Save"
                                                        >
                                                            <Check />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                setEditingId(
                                                                    null,
                                                                )
                                                            }
                                                            aria-label="Cancel"
                                                        >
                                                            <X />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                startEditing(
                                                                    slot,
                                                                )
                                                            }
                                                            aria-label="Edit"
                                                        >
                                                            <Pencil />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeSlot(slot)
                                                            }
                                                            aria-label="Delete"
                                                        >
                                                            <Trash2 className="text-destructive" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </>
    );
}
