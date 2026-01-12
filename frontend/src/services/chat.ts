import api from './api';
import type { ChatMessage, Gig } from '../types';

export const fetchChatGigs = async (): Promise<Gig[]> => {
  const response = await api.get<Gig[]>('/chat/gigs');
  return response.data;
};

export const fetchGigMessages = async (gigId: string): Promise<ChatMessage[]> => {
  const response = await api.get<ChatMessage[]>(`/chat/${gigId}/messages`);
  return response.data;
};
