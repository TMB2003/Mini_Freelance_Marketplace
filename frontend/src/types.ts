// Example if you have types defined
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface PublicUser {
  _id: string;
  name: string;
  email: string;
}

export interface Gig {
  _id: string;
  title: string;
  description?: string;
  budget: number;
  status: 'open' | 'assigned';
  ownerId: string | PublicUser;
  hiredFreelancerId?: string | PublicUser;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  _id: string;
  gigId: string | { _id: string; title?: string; status?: 'open' | 'assigned' };
  freelancerId: string | PublicUser;
  message: string;
  amount?: number;
  status: 'pending' | 'hired' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  gigId: string;
  senderId: string | PublicUser;
  text: string;
  createdAt: string;
  updatedAt: string;
}

// Or if the file is empty, just add:
// export {};