export interface Plan {
  id?: number;              // json-server auto id
  name: string;             // Basic / Premium / Gold
  price: number;            // Monthly price
  duration: number;         // in days (30 days)
  description?: string;     // Optional details
  isActive: boolean;        // Enable/Disable plan
  createdAt?: string;       // optional (future use)
}