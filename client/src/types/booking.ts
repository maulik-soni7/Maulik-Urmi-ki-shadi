export interface Booking {
  id: number;
  purpose: string;         // for what
  contactName: string;     // contact person name
  contactPhone: string;    // contact person mobile no.
  totalAmount: number;     // total payable amount
  tokenAmount: number;     // token paid
  tokenDate: string;       // token payment date
  remainingAmount: number; // remaining balance
  status: 'Booked with Token' | 'Booked without Token' | 'Completed' | 'Cancelled';
  isLocked: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateBookingInput = Omit<Booking, 'id' | 'remainingAmount' | 'createdAt' | 'updatedAt'>;

export interface BookingStats {
  totalCount: number;
  totalAmount: number;
  tokenAmount: number;
  remainingAmount: number;
}
