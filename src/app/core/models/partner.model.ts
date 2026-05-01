import { Venue } from './venue.model';

export interface Partner {
  id: string;
  name: string;
  email: string;
  spaces: Venue[];
}

export interface PartnerKPI {
  vendors: number;
  venues: number;
  active: number;
  pending: number;
}
