export interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  vendorId: {
    _id: string;
    fullName?: string;
    businessName?: string;
    email?: string;
    phone?: string;
  };
  venueId: {
    _id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  date: string;
  cost: number;
  status: 'approved' | 'rejected' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface BookedDates {
  bookedDates: string[];
}

export interface UserBookings {
  bookings: Booking[];
  totalSpent: number;
  totalBookings: number;
}

export interface VendorBookings {
  bookings: Booking[];
}

export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  approvalRate: number;
}
