import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MaskedAmountProps {
  amount: number;
  className?: string;
  prefix?: string;
  isLocked?: boolean;
}

export const MaskedAmount: React.FC<MaskedAmountProps> = ({
  amount,
  className = '',
  prefix = '₹ ',
  isLocked = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // If locked, amount must always remain masked
  const effectivelyVisible = isVisible && !isLocked;

  // Format masked value: e.g. 75000 -> 7****, 50000 -> 5****, 500 -> 5**
  const getMaskedValue = (val: number): string => {
    const str = Math.round(val).toString();
    if (str.length <= 1) return str;
    const firstDigit = str[0];
    const maskedDigits = '*'.repeat(str.length - 1);
    return `${firstDigit}${maskedDigits}`;
  };

  const formattedFull = amount.toLocaleString();
  const maskedDisplay = getMaskedValue(amount);

  return (
    <div className={`inline-flex items-center justify-end gap-1.5 group select-none ${className}`}>
      <span className="font-semibold tracking-wide font-mono text-sm">
        {prefix}{effectivelyVisible ? formattedFull : maskedDisplay}
      </span>
      {!isLocked && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible((prev) => !prev);
          }}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          title={effectivelyVisible ? 'Hide amount' : 'Show full amount'}
        >
          {effectivelyVisible ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      )}
    </div>
  );
};
