import type { Booking, BookingStats, CreateBookingInput } from '../types/booking';

const BASE_URL = '/api/bookings';

export const getBookings = async (search = '', status = 'ALL'): Promise<Booking[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'ALL') params.append('status', status);

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch records');
  return res.json();
};

export const getBookingStats = async (): Promise<BookingStats> => {
  const res = await fetch(`${BASE_URL}/stats`);
  if (!res.ok) throw new Error('Failed to fetch summary statistics');
  return res.json();
};

export const createBooking = async (data: CreateBookingInput): Promise<Booking> => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.errors?.[0]?.message || 'Failed to create record');
  }
  return res.json();
};

export const updateBooking = async (id: number, data: CreateBookingInput): Promise<Booking> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.errors?.[0]?.message || 'Failed to update record');
  }
  return res.json();
};

export const deleteBooking = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete record');
  }
};

export const toggleLock = async (id: number, code?: string): Promise<Booking> => {
  const res = await fetch(`${BASE_URL}/${id}/toggle-lock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to toggle lock status');
  }
  return res.json();
};
