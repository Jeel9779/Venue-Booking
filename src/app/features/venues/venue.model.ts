export interface Venue {
    _id: string;
    name: string;
    type: string;
    city: string;
    state: string;
    country: string;
    zip: string;
    capacity: number;
    pricePerDay: number;


    amenities: string[];

    mediaFiles?: string[];
    status: string;
    createdAt: string;
}