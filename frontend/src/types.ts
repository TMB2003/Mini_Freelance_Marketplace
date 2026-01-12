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
  createdAt: string;
  updatedAt: string;
}

// Or if the file is empty, just add:
// export {};