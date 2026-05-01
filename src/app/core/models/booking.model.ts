export interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  vendorId: {
    _id: string;
    name: string;
  };
  venueId: {
    _id: string;
    name: string;
    location: string;
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
