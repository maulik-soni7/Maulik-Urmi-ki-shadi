 import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, User, IndianRupee, FileText, Lock, Unlock } from 'lucide-react';
import type { Booking, CreateBookingInput } from '../types/booking';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingInput) => Promise<void>;
  initialData?: Booking | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreateBookingInput>({
    purpose: '',
    contactName: '',
    contactPhone: '',
    totalAmount: 0,
    tokenAmount: 0,
    tokenDate: new Date().toISOString().split('T')[0],
    status: 'Booked with Token',
    isLocked: true,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        purpose: initialData.purpose,
        contactName: initialData.contactName,
        contactPhone: initialData.contactPhone,
        totalAmount: initialData.totalAmount,
        tokenAmount: initialData.tokenAmount,
        tokenDate: initialData.tokenDate ? initialData.tokenDate.split('T')[0] : '',
        status: initialData.status,
        isLocked: initialData.isLocked ?? true,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        purpose: '',
        contactName: '',
        contactPhone: '',
        totalAmount: 0,
        tokenAmount: 0,
        tokenDate: new Date().toISOString().split('T')[0],
        status: 'Booked with Token',
        isLocked: true,
        notes: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        ...formData,
        totalAmount: Number(formData.totalAmount),
        tokenAmount: Number(formData.tokenAmount),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred saving record');
    } finally {
      setLoading(false);
    }
  };

  const calculatedRemaining = Math.max(0, (Number(formData.totalAmount) || 0) - (Number(formData.tokenAmount) || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div>
            <h2 className="text-lg font-semibold tracking-wide">
              {initialData ? 'Edit Booking / Record' : 'New Booking / Record'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter details for payment and client information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              For What (Purpose) *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                required
                type="text"
                placeholder="e.g. Wedding Photography, Venue Booking, Villa Rental"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Contact Person Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  required
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  required
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Total Payable Amount *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={formData.totalAmount || ''}
                  onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Token Paid *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={formData.tokenAmount || ''}
                  onChange={(e) => setFormData({ ...formData, tokenAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium text-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Balance Preview Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Auto-Calculated Remaining Balance:</span>
            <span className="font-bold text-slate-800 text-sm">
              ₹ {calculatedRemaining.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Token Payment Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  required
                  type="date"
                  value={formData.tokenDate}
                  onChange={(e) => setFormData({ ...formData, tokenDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              >
                <option value="Booked with Token">Booked with Token</option>
                <option value="Booked without Token">Booked without Token</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Notes / Remarks
            </label>
            <textarea
              rows={2}
              placeholder="Any additional details or remarks..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Lock Setting Option */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${formData.isLocked ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                {formData.isLocked ? <Lock size={15} /> : <Unlock size={15} />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {formData.isLocked ? 'Keep record locked after saving' : 'Leave record unlocked'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formData.isLocked ? 'Prevents accidental edits until unlocked' : 'Can be edited directly without unlocking'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isLocked: !formData.isLocked })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                formData.isLocked
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {formData.isLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 hover:shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
