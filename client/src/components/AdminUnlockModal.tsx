import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, X, Lock } from 'lucide-react';
import type { Booking } from '../types/booking';

interface AdminUnlockModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onConfirmUnlock: (booking: Booking, code: string) => Promise<void>;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({
  isOpen,
  booking,
  onClose,
  onConfirmUnlock,
}) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setError(null);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Take only the last character if typed
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(null);

    // Auto-advance to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirmUnlock(booking, code);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Incorrect code. Please ask Admin.');
      setDigits(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 text-center bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock size={26} />
          </div>

          <h2 className="text-lg font-bold tracking-tight">Ask Code to Admin to Unlock to Edit</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            This record is protected. Please enter the 4-digit code provided by your admin.
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* 4 Digit Code Inputs */}
          <div>
            <label className="block text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Enter 4-Digit Security Code
            </label>
            <div className="flex justify-center items-center gap-3">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-3 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || digits.join('').length < 4}
              className="py-3 px-4 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs shadow-amber-200 hover:shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Unlock to Edit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
