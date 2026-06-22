import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    edit,
    update,
} from '@/actions/App/Http/Controllers/Settings/VenueSettingsController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BrandingProps = {
    branding: {
        venue_name: string | null;
        contact_email: string | null;
        contact_phone: string | null;
        logo_url: string | null;
    };
};

export default function Branding({ branding }: BrandingProps) {
    const form = useForm<{
        venue_name: string;
        contact_email: string;
        contact_phone: string;
        logo: File | null;
    }>({
        venue_name: branding.venue_name ?? '',
        contact_email: branding.contact_email ?? '',
        contact_phone: branding.contact_phone ?? '',
        logo: null,
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(
        branding.logo_url,
    );

    function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        form.setData('logo', file);
        setLogoPreview(file ? URL.createObjectURL(file) : branding.logo_url);
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(update().url, { forceFormData: true, preserveScroll: true });
    }

    return (
        <>
            <Head title="Branding settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Branding"
                    description="Your venue name, logo, and contact details shown to players."
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="venue_name">Venue name</Label>
                        <Input
                            id="venue_name"
                            value={form.data.venue_name}
                            onChange={(event) =>
                                form.setData('venue_name', event.target.value)
                            }
                            required
                            placeholder="e.g. Pickle Court"
                        />
                        <InputError message={form.errors.venue_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="logo">Logo</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="size-full object-contain"
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        None
                                    </span>
                                )}
                            </div>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                                onChange={handleLogoChange}
                            />
                        </div>
                        <InputError message={form.errors.logo} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contact_email">Contact email</Label>
                        <Input
                            id="contact_email"
                            type="email"
                            value={form.data.contact_email}
                            onChange={(event) =>
                                form.setData(
                                    'contact_email',
                                    event.target.value,
                                )
                            }
                            placeholder="hello@venue.com"
                        />
                        <InputError message={form.errors.contact_email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contact_phone">Contact phone</Label>
                        <Input
                            id="contact_phone"
                            value={form.data.contact_phone}
                            onChange={(event) =>
                                form.setData(
                                    'contact_phone',
                                    event.target.value,
                                )
                            }
                            placeholder="09xx xxx xxxx"
                        />
                        <InputError message={form.errors.contact_phone} />
                    </div>

                    <Button type="submit" disabled={form.processing}>
                        Save
                    </Button>
                </form>
            </div>
        </>
    );
}

Branding.layout = {
    breadcrumbs: [{ title: 'Branding settings', href: edit() }],
};
