import { client } from './client';

export type Event = {
  id: string;
  name: string;
  place: string;
  startDate: string;
  ticketCount: number;
  ticketPrice: number;
  ticketsSold: number;
  ticketsAvailable: number;
};

export type PurchaseResponse = {
  order: {
    id: string;
    orderNumber: string;
    createdAt: string;
  };
  tickets: Array<{
    id: string;
    ticketNumber: string;
  }>;
};

export async function fetchEvents(): Promise<Event[]> {
  const { data } = await client.get<Event[]>('/events');
  return data;
}

export async function purchaseTickets(
  eventId: string,
  quantity: number
): Promise<PurchaseResponse> {
  const { data } = await client.post<PurchaseResponse>(
    `/events/${eventId}/purchase`,
    { quantity }
  );
  return data;
}
