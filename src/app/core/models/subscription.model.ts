export interface Plan {
  _id: string;
  name: string;
  duration_days: number;
  price: number;
  is_active: boolean;
  features: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type SubscriptionStatus = 'active' | 'grace' | 'expired';

export interface Subscription {
  _id: string;
  vendorId: string;
  planId: string | Plan;
  planSnapshot: {
    name: string;
    duration_days: number;
    price: number;
  };
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  graceEndDate: string;
  notifiedExpiry5Days: boolean;
  notifiedExpiryDay: boolean;
  notifiedGraceEnd: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionQueue {
  _id: string;
  vendorId: string;
  planId: string | Plan;
  planSnapshot: {
    name: string;
    duration_days: number;
    price: number;
  };
  position: number;
  isActivated: boolean;
  activatedAt: string | null;
  purchasedAt: string;
  createdAt?: string;
}
