export interface Review {
  _id: string;
  venueId: {
    _id: string;
    name: string;
    vendorId: string;
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

export interface ReviewStats {
  totalReviews: number;
  awaitingReview: number;
  approvedContent: number;
  liveAvgScore: number;
  distribution: { [key: number]: number };
}
