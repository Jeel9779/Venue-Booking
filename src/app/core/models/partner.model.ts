import { Venue, VendorInfo } from './venue.model';

/**
 * Represents a Vendor/Partner and their associated venues.
 */
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
export interface PartnerKPI {
  vendors: number;
  venues: number;
  active: number;
  pending: number;
  totalReviews: number;
  avgRating: number;
}
