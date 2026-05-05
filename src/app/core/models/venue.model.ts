export interface VendorInfo {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  status: string;
  address: string;
  pincode: string;
  state: string;
}

export interface Review {
  userId: string;
  rating: number;
  feedback: string;
  _id: string;
  createdAt: string;
}

export interface Venue {
  _id: string;
  vendorId: string | VendorInfo;
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
  averageRating: number;
  ratingCount: number;
  status: 'pending' | 'approved' | 'rejected';
  adminDescription: string;
  isSubscriptionActive: boolean;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export type FilterState = 'all' | 'pending' | 'approved' | 'rejected';