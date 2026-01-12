import api from './api';
import type { Bid } from '../types';

export const createBid = async (data: {
  gigId: string;
  message: string;
  amount?: number;
}): Promise<Bid> => {
  const response = await api.post<Bid>('/bids', data);
  return response.data;
};

export const getGigBids = async (gigId: string): Promise<Bid[]> => {
  const response = await api.get<Bid[]>(`/bids/${gigId}`);
  return response.data;
};

export const hireBid = async (bidId: string): Promise<{ message: string; bid: Bid | null } > => {
  const response = await api.patch<{ message: string; bid: Bid | null }>(`/bids/${bidId}/hire`);
  return response.data;
};
