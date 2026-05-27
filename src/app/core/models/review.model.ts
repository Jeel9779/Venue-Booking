// Purpose: Model: Defines data structures and types for the application.
export interface Review {
  _id: string;
  venueId: {
    _id: string;
    name: string;
    vendorId: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  rating: number;
  feedback: string;
  status: 'pending' | 'approved' | 'rejected';
  venueName?: string; // Support for backend flat field
  createdAt: string;
  updatedAt: string;
}

// Defines the data model structure
export interface ReviewStats {
  totalReviews: number;
  awaitingReview: number;
  approvedContent: number;
  rejectedContent: number;
  liveAvgScore: number;
  distribution: { [key: number]: number };
}
