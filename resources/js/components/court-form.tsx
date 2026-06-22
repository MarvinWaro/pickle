import { Link, useForm } from '@inertiajs/react';
import { ImagePlus, X } from 'lucide-react';
import { useState } from 'react';
import {
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/CourtController';
import { AmenitiesInput } from '@/components/amenities-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index } from '@/routes/admin/courts';
import type { Court } from '@/types';

const MAX_GALLERY_IMAGES = 5;

type CourtFormData = {
    name: string;
    description: string;
    surface: string;
    price_per_hour: string;
    is_active: boolean;
    amenities: string[];
    image: File | null;
    images: File[];
    removed_image_ids: string[];
};

type CourtFormProps = {
    court?: Court;
    amenitySuggestions: string[];
};

export function CourtForm({ court, amenitySuggestions }: CourtFormProps) {
    const isEdit = Boolean(court);

    const form = useForm<CourtFormData>({
        name: court?.name ?? '',
        description: court?.description ?? '',
        surface: court?.surface ?? '',
        price_per_hour: court?.price_per_hour ?? '',
        is_active: court?.is_active ?? true,
        amenities: court?.amenities?.map((amenity) => amenity.name) ?? [],
        image: null,
        images: [],
        removed_image_ids: [],
    });

    const { data, setData, processing, errors } = form;
    const [imagePreview, setImagePreview] = useState<string | null>(
        court?.image_url ?? null,
    );
    const [newImages, setNewImages] = useState<{ file: File; url: string }[]>(
        [],
    );

    const visibleExistingImages = (court?.images ?? []).filter(
        (image) => !data.removed_image_ids.includes(image.id),
    );
    const galleryRemaining =
        MAX_GALLERY_IMAGES - visibleExistingImages.length - newImages.length;

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        setData('image', file);
        setImagePreview(
            file ? URL.createObjectURL(file) : (court?.image_url ?? null),
        );
    }

    function handleGalleryAdd(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = Array.from(event.target.files ?? []);
        const allowed = selected
            .slice(0, Math.max(0, galleryRemaining))
            .map((file) => ({ file, url: URL.createObjectURL(file) }));
        const next = [...newImages, ...allowed];

        setNewImages(next);
        setData(
            'images',
            next.map((item) => item.file),
        );
        event.target.value = '';
    }

    function removeNewImage(url: string) {
        const next = newImages.filter((item) => item.url !== url);
        setNewImages(next);
        setData(
            'images',
            next.map((item) => item.file),
        );
    }

    function removeExistingImage(id: string) {
        setData('removed_image_ids', [...data.removed_image_ids, id]);
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();

        const options = { forceFormData: true, preserveScroll: true };

        if (court) {
            form.transform((current) => ({ ...current, _method: 'put' }));
            form.post(update(court.id).url, options);
        } else {
            form.transform((current) => current);
            form.post(store().url, options);
        }
    }

    return (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Court details</CardTitle>
                        <CardDescription>
                            Basic information shown to players browsing your
                            courts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                required
                                placeholder="e.g. Court A"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="surface">Surface</Label>
                            <Input
                                id="surface"
                                value={data.surface}
                                onChange={(event) =>
                                    setData('surface', event.target.value)
                                }
                                placeholder="e.g. Indoor, Outdoor, Acrylic"
                            />
                            <InputError message={errors.surface} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                placeholder="Optional notes about this court"
                            />
                            <InputError message={errors.description} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Amenities</CardTitle>
                        <CardDescription>
                            Optional. Add what this court offers — reuse
                            existing ones or type a new amenity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AmenitiesInput
                            id="amenities"
                            value={data.amenities}
                            onChange={(next) => setData('amenities', next)}
                            suggestions={amenitySuggestions}
                            disabled={processing}
                        />
                        <InputError
                            className="mt-2"
                            message={errors.amenities}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Gallery photos</CardTitle>
                        <CardDescription>
                            Optional. Add up to {MAX_GALLERY_IMAGES} extra angles
                            of the court. JPG, PNG or WebP, max 5MB each.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(visibleExistingImages.length > 0 ||
                            newImages.length > 0) && (
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {visibleExistingImages.map((image) => (
                                    <div
                                        key={image.id}
                                        className="group relative aspect-square overflow-hidden rounded-lg border"
                                    >
                                        <img
                                            src={image.image_url ?? ''}
                                            alt="Court angle"
                                            className="size-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeExistingImage(image.id)
                                            }
                                            className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                            aria-label="Remove photo"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {newImages.map((item) => (
                                    <div
                                        key={item.url}
                                        className="group relative aspect-square overflow-hidden rounded-lg border"
                                    >
                                        <img
                                            src={item.url}
                                            alt="New court angle"
                                            className="size-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeNewImage(item.url)
                                            }
                                            className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                            aria-label="Remove photo"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                            <Input
                                id="images"
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleGalleryAdd}
                                disabled={galleryRemaining <= 0}
                            />
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {MAX_GALLERY_IMAGES - galleryRemaining} /{' '}
                                {MAX_GALLERY_IMAGES} used
                            </span>
                        </div>
                        <InputError message={errors.images} />
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>
                            Rate charged per hour.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price_per_hour">
                                Price per hour (₱)
                            </Label>
                            <Input
                                id="price_per_hour"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price_per_hour}
                                onChange={(event) =>
                                    setData(
                                        'price_per_hour',
                                        event.target.value,
                                    )
                                }
                                required
                                placeholder="0.00"
                            />
                            <InputError message={errors.price_per_hour} />
                        </div>

                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={data.is_active}
                                onCheckedChange={(checked) =>
                                    setData('is_active', checked === true)
                                }
                            />
                            <span className="text-sm">
                                Active (visible to players)
                            </span>
                        </label>
                        <InputError message={errors.is_active} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Court image</CardTitle>
                        <CardDescription>
                            JPG, PNG or WebP. Max 5MB.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Court preview"
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <ImagePlus className="size-8" />
                                    <span className="text-sm">
                                        No image yet
                                    </span>
                                </div>
                            )}
                        </div>
                        <Input
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                        />
                        {form.progress && (
                            <progress
                                value={form.progress.percentage}
                                max="100"
                                className="w-full"
                            >
                                {form.progress.percentage}%
                            </progress>
                        )}
                        <InputError message={errors.image} />
                    </CardContent>
                </Card>

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={processing}>
                        {isEdit ? 'Save changes' : 'Create court'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href={index()}>Cancel</Link>
                    </Button>
                </div>
            </div>
        </form>
    );
}
