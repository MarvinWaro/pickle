export type Amenity = {
    id: string;
    name: string;
};

export type CourtImage = {
    id: string;
    path: string;
    image_url: string | null;
    sort_order: number;
};

export type Court = {
    id: string;
    name: string;
    description: string | null;
    surface: string | null;
    image_path: string | null;
    image_url: string | null;
    price_per_hour: string;
    payment_qr_path: string | null;
    is_active: boolean;
    sort_order: number;
    amenities?: Amenity[];
    images?: CourtImage[];
    bookings_count?: number;
    created_at: string;
    updated_at: string;
};
