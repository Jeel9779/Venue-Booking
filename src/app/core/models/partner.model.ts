// Purpose: Model: Defines data structures and types for the application.
import { Venue, VendorInfo } from './venue.model';

/**
 * Represents a Vendor/Partner and their associated venues.
 */
// Defines the data model structure
export interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  isSubscriptionActive?: boolean;
  spaces: Venue[];
}

/**
 * Key Performance Indicators for the Partner Dashboard.
 */
// Defines the data model structure
export interface PartnerKPI {
  vendors: number;
  venues: number;
  active: number;
  pending: number;
  totalReviews: number;
  avgRating: number;
}
