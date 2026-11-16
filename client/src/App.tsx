import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import type { Booking, CreateBookingInput } from './types/booking';
import * as api from './api/bookingApi';
import { BookingModal } from './components/BookingModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { BookingCard } from './components/BookingCard';
import { AdminUnlockModal } from './components/AdminUnlockModal';

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<Booking | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bookingsData = await api.getBookings(search, statusFilter);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleCreateOrUpdate = async (data: CreateBookingInput) => {
    if (editingBooking) {
      await api.updateBooking(editingBooking.id, data);
    } else {
      await api.createBooking(data);
    }
    await fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.deleteBooking(deleteTarget.id);
    await fetchData();
  };

  // Called when user clicks lock/unlock button on a card
  const handleToggleLockClick = async (booking: Booking) => {
    if (booking.isLocked) {
      // Prompt for 4-digit code from admin
      setUnlockTarget(booking);
    } else {
      // Locking an already unlocked record doesn't need admin code
      try {
        await api.toggleLock(booking.id);
        await fetchData();
      } catch (err: any) {
        alert(err.message || 'Failed to lock record');
      }
    }
  };

  const handleConfirmUnlock = async (booking: Booking, code: string) => {
    await api.toggleLock(booking.id, code);
    await fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Deal & Booking Tracker</h1>
              <p className="text-xs text-slate-500 font-medium">Record, track token payments & pending balances</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData()}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                setEditingBooking(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs shadow-indigo-200 hover:shadow-md transition cursor-pointer"
            >
              <Plus size={18} />
              <span>Add Record</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by purpose, contact person, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            >
              <option value="ALL">All Status</option>
              <option value="Booked with Token">Booked with Token</option>
              <option value="Booked without Token">Booked without Token</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Card Listing (Mobile First) */}
        <div>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Loading records...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-700">No records found</p>
                  <p className="text-xs">Tap "Add Record" to create your first entry.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onEdit={(b) => {
                    setEditingBooking(b);
                    setIsModalOpen(true);
                  }}
                  onDelete={(b) => setDeleteTarget(b)}
                  onToggleLock={handleToggleLockClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingBooking}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget ? `${deleteTarget.purpose} (${deleteTarget.contactName})` : ''}
      />

      {/* Admin 4-Digit Security Code Unlock Modal */}
      <AdminUnlockModal
        isOpen={Boolean(unlockTarget)}
        booking={unlockTarget}
        onClose={() => setUnlockTarget(null)}
        onConfirmUnlock={handleConfirmUnlock}
      />
    </div>
  );
}

export default App;
