import { Router } from 'express';
import {
  getBookings,
  getBookingStats,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  toggleLock,
} from '../controllers/bookingController';

const router = Router();

router.get('/stats', getBookingStats);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.patch('/:id/toggle-lock', toggleLock);
router.delete('/:id', deleteBooking);

export default router;
