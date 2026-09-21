'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  label?: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  text,
  label = 'More information',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={`relative inline-flex align-middle ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1E1E1E] border border-[#404040] text-[#757575] hover:text-[#FF3333] hover:border-[#FF0000]/40 transition"
        aria-label={label}
        aria-expanded={open}
      >
        <Info className="w-3 h-3" />
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-56 sm:w-64 p-3 rounded-lg bg-[#282828] border border-[#404040] text-[11px] leading-relaxed text-[#B3B3B3] shadow-xl"
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#282828] border-l border-t border-[#404040]" />
          {text}
        </div>
      )}
    </div>
  );
};
