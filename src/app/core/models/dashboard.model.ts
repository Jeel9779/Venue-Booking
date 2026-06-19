// Purpose: Model: Defines data structures and types for the application.
// models/dashboard.model.ts
// Defines the data model structure
export interface Stat {
    title: string;
    value: string | number;
    change: string;
    icon: string;
}

// Defines the data model structure
export interface TableItem {
    id: number;
    name: string;
    location: string;
    owner: string;
    company: string;
    date: string;
    status: string;
    files?: number;
    image: string;
}

// Defines the data model structure
export interface DashboardSummaryResponse {
  totalBookings: number;
  netRevenue: number;
  activeVenues: number;
  pendingApprovalsCount: number;
  cancelledBookingsCount: number;
  totalUsers: number;
  totalVendors: number;
  bookingVelocity: {
    thisWeek: number;
    lastWeek: number;
    changePercent: number;
    isIncreasing: boolean;
  };
  topVendors: {
    name: string;
    email: string;
    count: number;
    revenue: number;
  }[];
  topSubscriptions: {
    name: string;
    count: number;
    totalEarned: number;
  }[];
  pendingApprovals: {
    id: string;
    type: string;
    name: string;
    subText: string;
    date: string;
  }[];
  paymentIssues: {
    id: string;
    type: string;
    description: string;
    amount: number;
    vendor: string;
    date: string;
  }[];
  cityGrowth: {
    cityName: string;
    bookingsCount: number;
    venuesCount: number;
    revenue: number;
    totalScore: number;
  }[];
  mostBookedDays: number[];
  peakBookingHours: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}