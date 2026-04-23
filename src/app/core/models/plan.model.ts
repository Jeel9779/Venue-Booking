export interface Plan {
  id?: string;              // json-server auto id
  name: string;             // Basic / Premium / Gold
  price: number;            // Monthly price
  duration: number;         // in days (30 days)
  description?: string;     // Optional details
  isActive: boolean;        // Enable/Disable plan
  features: string[];      
  createdAt?: string;       // optional (future use)
  updatedAt?: string;
}