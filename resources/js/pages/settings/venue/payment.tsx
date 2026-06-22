import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    edit,
    update,
} from '@/actions/App/Http/Controllers/Settings/PaymentSettingsController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type PaymentProps = {
    payment: {
        payment_method: string | null;
        payment_account_name: string | null;
        payment_account_number: string | null;
        messenger_link: string | null;
        payment_instructions: string | null;
        hold_minutes: string | null;
        qr_url: string | null;
    };
};

export default function Payment({ payment }: PaymentProps) {
    const form = useForm<{
        payment_method: string;
        payment_account_name: string;
        payment_account_number: string;
        messenger_link: string;
        payment_instructions: string;
        hold_minutes: string;
        payment_qr: File | null;
    }>({
        payment_method: payment.payment_method ?? '',
        payment_account_name: payment.payment_account_name ?? '',
        payment_account_number: payment.payment_account_number ?? '',
        messenger_link: payment.messenger_link ?? '',
        payment_instructions: payment.payment_instructions ?? '',
        hold_minutes: payment.hold_minutes ?? '5',
        payment_qr: null,
    });
    const [qrPreview, setQrPreview] = useState<string | null>(payment.qr_url);

    function handleQrChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        form.setData('payment_qr', file);
        setQrPreview(file ? URL.createObjectURL(file) : payment.qr_url);
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(update().url, { forceFormData: true, preserveScroll: true });
    }

    return (
        <>
            <Head title="Payment settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Payment"
                    description="The QR and account details players use to pay, plus how they send proof."
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="payment_qr">Payment QR code</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex size-28 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                                {qrPreview ? (
                                    <img
                                        src={qrPreview}
                                        alt="QR preview"
                                        className="size-full object-contain p-1"
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        No QR
                                    </span>
                                )}
                            </div>
                            <Input
                                id="payment_qr"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleQrChange}
                            />
                        </div>
                        <InputError message={form.errors.payment_qr} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="payment_method">
                                Payment method
                            </Label>
                            <Input
                                id="payment_method"
                                value={form.data.payment_method}
                                onChange={(event) =>
                                    form.setData(
                                        'payment_method',
                                        event.target.value,
                                    )
                                }
                                placeholder="GCash, Maya, …"
                            />
                            <InputError message={form.errors.payment_method} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="payment_account_number">
                                Account number
                            </Label>
                            <Input
                                id="payment_account_number"
                                value={form.data.payment_account_number}
                                onChange={(event) =>
                                    form.setData(
                                        'payment_account_number',
                                        event.target.value,
                                    )
                                }
                                placeholder="09xx xxx xxxx"
                            />
                            <InputError
                                message={form.errors.payment_account_number}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="payment_account_name">
                            Account name
                        </Label>
                        <Input
                            id="payment_account_name"
                            value={form.data.payment_account_name}
                            onChange={(event) =>
                                form.setData(
                                    'payment_account_name',
                                    event.target.value,
                                )
                            }
                            placeholder="Juan Dela Cruz"
                        />
                        <InputError message={form.errors.payment_account_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="messenger_link">
                            Messenger link (for proof)
                        </Label>
                        <Input
                            id="messenger_link"
                            value={form.data.messenger_link}
                            onChange={(event) =>
                                form.setData(
                                    'messenger_link',
                                    event.target.value,
                                )
                            }
                            placeholder="https://m.me/yourpage"
                        />
                        <p className="text-xs text-muted-foreground">
                            Players send their payment screenshot here. Your
                            Facebook page link, e.g. https://m.me/yourpage.
                        </p>
                        <InputError message={form.errors.messenger_link} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="payment_instructions">
                            Payment instructions
                        </Label>
                        <Textarea
                            id="payment_instructions"
                            value={form.data.payment_instructions}
                            onChange={(event) =>
                                form.setData(
                                    'payment_instructions',
                                    event.target.value,
                                )
                            }
                            placeholder="Scan the QR, pay the exact amount, then send your receipt on Messenger."
                        />
                        <InputError
                            message={form.errors.payment_instructions}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="hold_minutes">
                            Hold time (minutes)
                        </Label>
                        <Input
                            id="hold_minutes"
                            type="number"
                            min="1"
                            value={form.data.hold_minutes}
                            onChange={(event) =>
                                form.setData('hold_minutes', event.target.value)
                            }
                            required
                            className="w-32"
                        />
                        <p className="text-xs text-muted-foreground">
                            How long a slot is held for an unpaid booking before
                            it's released.
                        </p>
                        <InputError message={form.errors.hold_minutes} />
                    </div>

                    <Button type="submit" disabled={form.processing}>
                        Save
                    </Button>
                </form>
            </div>
        </>
    );
}

Payment.layout = {
    breadcrumbs: [{ title: 'Payment settings', href: edit() }],
};
