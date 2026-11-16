import React from 'react';
import { 
  Phone, 
  Calendar, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText
} from 'lucide-react';
import type { Booking } from '../types/booking';
import { MaskedAmount } from './MaskedAmount';

interface BookingCardProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onToggleLock: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onEdit,
  onDelete,
  onToggleLock,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Booked with Token':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Booked with Token
          </span>
        );
      case 'Booked without Token':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Booked without Token
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const isInactive = booking.status === 'Completed' || booking.status === 'Cancelled';

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isInactive
          ? 'bg-slate-100/90 border-slate-300/80 opacity-75 shadow-none hover:opacity-100'
          : 'bg-white border-slate-200/80 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Inactive notice watermark banner */}
      {isInactive && (
        <div className="bg-slate-200/90 px-4 py-1 text-[11px] font-medium text-slate-600 flex items-center justify-between border-b border-slate-300/60">
          <span className="flex items-center gap-1.5">
            {booking.status === 'Completed' ? '✓ Closed / Completed' : '✕ Inactive / Cancelled'}
          </span>
          <span className="text-[10px] text-slate-500">
            {booking.isLocked ? 'Unlock with PIN to edit' : 'Unlocked (Editable)'}
          </span>
        </div>
      )}

      {/* Top Header: Purpose & Status */}
      <div
        className={`p-4 border-b flex items-start justify-between gap-3 ${
          isInactive
            ? 'border-slate-200/80 bg-slate-100/50'
            : 'border-slate-100 bg-slate-50/50'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-bold text-base leading-snug truncate ${
                isInactive ? 'text-slate-600 line-through-none' : 'text-slate-900'
              }`}
            >
              {booking.purpose}
            </h3>
            {getStatusBadge(booking.status)}
          </div>
          {booking.notes && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
              <FileText size={12} className="shrink-0 text-slate-400" />
              {booking.notes}
            </p>
          )}
        </div>

        {/* Lock status pill badge */}
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
            booking.isLocked
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {booking.isLocked ? <Lock size={11} /> : <Unlock size={11} />}
          {booking.isLocked ? 'Locked' : 'Unlocked'}
        </span>
      </div>

      {/* Middle Section: Contact & Date */}
      <div
        className={`p-4 grid grid-cols-2 gap-3 text-xs ${
          isInactive ? 'bg-slate-50/60' : 'bg-white'
        }`}
      >
        <div className="space-y-1">
          <span className="text-slate-400 font-medium uppercase tracking-wider block text-[10px]">
            Contact Person
          </span>
          <p className="font-semibold text-slate-800 text-sm truncate">{booking.contactName}</p>
          <a
            href={`tel:${booking.contactPhone}`}
            className="inline-flex items-center gap-1.5 text-indigo-600 font-medium hover:underline pt-0.5"
          >
            <Phone size={12} className="text-indigo-500" />
            <span>{booking.contactPhone}</span>
          </a>
        </div>

        <div className="space-y-1 text-right">
          <span className="text-slate-400 font-medium uppercase tracking-wider block text-[10px]">
            Token Date
          </span>
          <p className="inline-flex items-center gap-1 text-slate-700 font-medium text-xs pt-0.5">
            <Calendar size={13} className="text-slate-400" />
            {new Date(booking.tokenDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Financial Amounts Breakdown (Mobile Optimized Cards) */}
      <div
        className={`px-4 py-3 border-t border-b grid grid-cols-3 gap-2 text-center ${
          isInactive
            ? 'bg-slate-100/70 border-slate-200/80'
            : 'bg-slate-50/80 border-slate-100'
        }`}
      >
        <div className={`p-2 rounded-xl border shadow-2xs ${isInactive ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-200/60'}`}>
          <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider">
            Total
          </span>
          <div className="mt-0.5 flex justify-center">
            <MaskedAmount amount={booking.totalAmount} isLocked={booking.isLocked} className="text-slate-800 text-xs sm:text-sm" />
          </div>
        </div>

        <div className={`p-2 rounded-xl border shadow-2xs ${isInactive ? 'bg-slate-50 border-slate-200' : 'bg-white border-emerald-100/80'}`}>
          <span className="text-[10px] text-emerald-700 font-medium block uppercase tracking-wider">
            Paid
          </span>
          <div className="mt-0.5 flex justify-center">
            <MaskedAmount amount={booking.tokenAmount} isLocked={booking.isLocked} className="text-emerald-600 text-xs sm:text-sm" />
          </div>
        </div>

        <div className={`p-2 rounded-xl border shadow-2xs ${isInactive ? 'bg-slate-50 border-slate-200' : 'bg-white border-amber-100/80'}`}>
          <span className="text-[10px] text-amber-700 font-medium block uppercase tracking-wider">
            Balance
          </span>
          <div className="mt-0.5 flex justify-center">
            <MaskedAmount amount={booking.remainingAmount} isLocked={booking.isLocked} className="text-amber-600 text-xs sm:text-sm" />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar: Lock toggle, Edit, Delete, Quick Call */}
      <div
        className={`px-4 py-3 flex items-center justify-between gap-2 ${
          isInactive ? 'bg-slate-100/60' : 'bg-white'
        }`}
      >
        {/* Quick direct call action */}
        <a
          href={`tel:${booking.contactPhone}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Phone size={13} />
          <span>Call</span>
        </a>

        {/* Lock, Edit, Delete buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleLock(booking)}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              booking.isLocked
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={booking.isLocked ? 'Click to Unlock' : 'Click to Lock'}
          >
            {booking.isLocked ? <Lock size={15} /> : <Unlock size={15} />}
            <span className="text-[11px] font-semibold">{booking.isLocked ? 'Unlock' : 'Lock'}</span>
          </button>

          <button
            onClick={() => !booking.isLocked && onEdit(booking)}
            disabled={booking.isLocked}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition ${
              booking.isLocked
                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border-slate-200 cursor-pointer shadow-2xs'
            }`}
            title={booking.isLocked ? 'Unlock to edit' : 'Edit record'}
          >
            <Edit3 size={15} />
            <span className="text-[11px] font-semibold">Edit</span>
          </button>

          <button
            onClick={() => !booking.isLocked && onDelete(booking)}
            disabled={booking.isLocked}
            className={`p-2 rounded-xl border text-xs font-medium transition ${
              booking.isLocked
                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200 cursor-pointer shadow-2xs'
            }`}
            title={booking.isLocked ? 'Unlock to delete' : 'Delete record'}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
