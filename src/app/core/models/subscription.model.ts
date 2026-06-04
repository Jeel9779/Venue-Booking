// Purpose: Model: Defines data structures and types for the application.
export interface Plan {
  _id: string;
  name: string;
  duration_days: number;
  price: number;
  planType?: 'base' | 'addon';
  is_active: boolean;
  /**
   * When this plan is an add‑on, stores the `_id` of the base plan it extends.
   * Not present for base plans. Optional to keep compatibility with existing data.
   */
  parentPlanId?: string | null;
  features: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type SubscriptionStatus = 'active' | 'grace' | 'expired' | 'suspended' | 'cancelled';

// Defines the data model structure
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

// Defines the data model structure
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

export interface AddonSubscription {
  _id: string;
  userId: string | any;
  addonId: string | Plan;
  baseSubscriptionId: string | Subscription | null;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  suspensionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
