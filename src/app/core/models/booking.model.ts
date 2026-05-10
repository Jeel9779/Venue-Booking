export interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  vendorId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    businessName: string;
    businessType?: string;
  };
  venueId: {
    _id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip?: string;
    country?: string;
  };
  date: string;
  cost: number;
  totalBookingAmount: number;
  upfrontPaymentAmount: number;
  amountPaid: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  transactionId: string;
  paymentTimestamp: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingStats {
  totalRevenue: number;
  collected: number;
  outstanding: number;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  todayCount: number;
}

export interface BookedDates {
  dates: string[];
}

export interface UserBookings {
  bookings: Booking[];
}

export interface VendorBookings {
  bookings: Booking[];
}

export interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}
