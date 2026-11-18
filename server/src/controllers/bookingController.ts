import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Helper to safely parse numeric ID from req.params
const parseId = (idParam: any): number => {
  const str = Array.isArray(idParam) ? idParam[0] : idParam;
  return str ? parseInt(String(str), 10) : NaN;
};

// Validation schema
const bookingSchema = z.object({
  purpose: z.string().min(1, 'Purpose ("for what") is required'),
  contactName: z.string().min(1, 'Contact person name is required'),
  contactPhone: z.string().min(5, 'Valid contact mobile number is required'),
  totalAmount: z.coerce.number().min(0, 'Total payable amount must be positive'),
  tokenAmount: z.coerce.number().min(0, 'Token paid must be non-negative'),
  tokenDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid token payment date is required',
  }),
  status: z.string().optional().default('Booked with Token'),
  isLocked: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

// GET /api/bookings - Listing with search and filtering
export const getBookings = async (req: Request, res: Response) => {
  try {
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const whereClause: any = {};

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { purpose: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { contactPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: {
        [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc',
      },
    });

    res.json(bookings);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// GET /api/bookings/stats - Summary metrics
export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const totalCount = await prisma.booking.count();
    const aggregates = await prisma.booking.aggregate({
      _sum: {
        totalAmount: true,
        tokenAmount: true,
        remainingAmount: true,
      },
    });

    res.json({
      totalCount,
      totalAmount: aggregates._sum.totalAmount || 0,
      tokenAmount: aggregates._sum.tokenAmount || 0,
      remainingAmount: aggregates._sum.remainingAmount || 0,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// GET /api/bookings/:id - Single booking
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve booking' });
  }
};

// POST /api/bookings - Create booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const validatedData = bookingSchema.parse(req.body);

    const remainingAmount = Math.max(0, validatedData.totalAmount - validatedData.tokenAmount);

    const booking = await prisma.booking.create({
      data: {
        purpose: validatedData.purpose,
        contactName: validatedData.contactName,
        contactPhone: validatedData.contactPhone,
        totalAmount: validatedData.totalAmount,
        tokenAmount: validatedData.tokenAmount,
        tokenDate: new Date(validatedData.tokenDate),
        remainingAmount,
        status: validatedData.status || 'Booked with Token',
        isLocked: validatedData.isLocked !== undefined ? validatedData.isLocked : true,
        notes: validatedData.notes || null,
      },
    });

    res.status(201).json(booking);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// PUT /api/bookings/:id - Update booking
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const currentBooking = await prisma.booking.findUnique({ where: { id } });
    if (!currentBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (currentBooking.isLocked && req.body.isLocked !== false) {
      return res.status(403).json({ error: 'This record is locked. Please unlock it before editing.' });
    }

    const validatedData = bookingSchema.parse(req.body);
    const remainingAmount = Math.max(0, validatedData.totalAmount - validatedData.tokenAmount);

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        purpose: validatedData.purpose,
        contactName: validatedData.contactName,
        contactPhone: validatedData.contactPhone,
        totalAmount: validatedData.totalAmount,
        tokenAmount: validatedData.tokenAmount,
        tokenDate: new Date(validatedData.tokenDate),
        remainingAmount,
        status: validatedData.status,
        isLocked: validatedData.isLocked !== undefined ? validatedData.isLocked : currentBooking.isLocked,
        notes: validatedData.notes || null,
      },
    });

    res.json(updatedBooking);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

// PATCH /api/bookings/:id/toggle-lock - Toggle row lock state
export const toggleLock = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const currentBooking = await prisma.booking.findUnique({ where: { id } });
    if (!currentBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If currently locked and attempting to unlock, verify 4-digit code
    if (currentBooking.isLocked) {
      const { code } = req.body;
      const ADMIN_PIN = process.env.ADMIN_PIN || '2702';

      if (!code || String(code).trim() !== ADMIN_PIN) {
        return res.status(401).json({ error: 'Incorrect 4-digit code. Please ask Admin for the code.' });
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { isLocked: !currentBooking.isLocked },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error toggling lock:', error);
    res.status(500).json({ error: 'Failed to toggle lock status' });
  }
};

// DELETE /api/bookings/:id - Delete booking
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const currentBooking = await prisma.booking.findUnique({ where: { id } });
    if (!currentBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (currentBooking.isLocked) {
      return res.status(403).json({ error: 'This record is locked. Please unlock it before deleting.' });
    }

    await prisma.booking.delete({
      where: { id },
    });

    res.json({ message: 'Booking deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};
