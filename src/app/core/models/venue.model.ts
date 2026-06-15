// Purpose: Model: Defines data structures and types for the application.
import { Pagination, initialPagination } from './pagination.model';

// Defines the data model structure
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

// Defines the data model structure
export interface Review {
  userId: string;
  rating: number;
  feedback: string;
  _id: string;
  createdAt: string;
}

// Defines the data model structure
export interface Venue {
  _id: string;
  vendorId: string | VendorInfo;
  name: string;
  type: string;
  capacity: number;
  description: string;
  pricePerDay: number;
  perPlateCost: number;
  vegPrice: number;
  nonVegPrice: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: string;
  lng: string;
  venueTypes?: string[];
  eventsSupported?: string[];
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
  deactivated: boolean;
  deactivatedBy: 'admin' | 'vendor' | null;
  deactivationReason: string;
}

export type FilterState = 'all' | 'pending' | 'approved' | 'rejected';