import api from './api';
import type { Gig } from '../types';

export const fetchGigs = async (params?: {
  search?: string;
  minBudget?: number;
  maxBudget?: number;
}): Promise<Gig[]> => {
  const response = await api.get<Gig[]>('/gigs', {
    params,
  });
  return response.data;
};

export const createGig = async (data: {
  title: string;
  description?: string;
  budget: number;
}): Promise<Gig> => {
  const response = await api.post<Gig>('/gigs', data);
  return response.data;
};
