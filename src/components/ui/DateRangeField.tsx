'use client';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { forwardRef } from 'react';

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (dates: [Date | null, Date | null]) => void;
  placeholder?: string;
  minDate?: Date;
  selectsRange?: boolean;
}

const DateInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void; placeholder?: string }>(
  function DateInput({ value, onClick, placeholder }, ref) {
    return (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        className="input flex w-full items-center justify-between text-left"
      >
        <span className={value ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
          {value || placeholder || 'Select date'}
        </span>
        <Calendar className="h-4 w-4 text-slate-400" />
      </button>
    );
  },
);

export function DateRangeField({ startDate, endDate, onChange, placeholder, minDate }: Props) {
  return (
    <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={onChange}
      minDate={minDate}
      dateFormat="MMM d, yyyy"
      customInput={<DateInput placeholder={placeholder} />}
      isClearable
    />
  );
}

export function DateField({
  selected,
  onChange,
  placeholder,
  minDate,
}: {
  selected: Date | null;
  onChange: (d: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
}) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      minDate={minDate}
      dateFormat="MMM d, yyyy"
      customInput={<DateInput placeholder={placeholder} />}
      isClearable
    />
  );
}
