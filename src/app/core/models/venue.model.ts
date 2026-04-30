export interface Venue {
  _id: string;
  vendorId: string | { _id: string; fullName: string; email: string; };
  name: string;
  type: string;
  capacity: number;
  description: string;
  pricePerDay: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: string;
  lng: string;
  amenities: string[];
  availableFrom: string;
  mediaFiles: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminDescription: string;
  createdAt: string;
  updatedAt: string;
}

export type FilterState = 'all' | 'pending' | 'approved' | 'rejected';