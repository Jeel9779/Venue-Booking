export interface Venue {
  _id: string;
  name: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  capacity: number;
  pricePerDay: number;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  amenities: string[];
  mediaFiles: string[];
  createdAt: string;
  adminDescription?: string;
}

type FilterState = 'all' | 'pending' | 'approved' | 'rejected';


/*  export interface Venue {
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


 */