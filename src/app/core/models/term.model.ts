// Purpose: Model: Defines data structures and types for the application.
export interface Term {
  _id: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTermPayload {
  content: string;
  version: string;
  isActive: boolean;
}

export interface UpdateTermPayload {
  content?: string;
  version?: string;
  isActive?: boolean;
}
