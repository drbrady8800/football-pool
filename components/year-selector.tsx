"use client";

import { Suspense } from 'react';
import { getBowlYear } from '@/lib/utils';
import { useYear } from '@/lib/contexts/year-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function YearSelectorInner() {
  const { year, setYear } = useYear();
  const currentYear = getBowlYear();

  const startYear = 2024;
  const endYear = currentYear;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse();

  const handleYearChange = (yearString: string) => {
    const newYear = parseInt(yearString, 10);
    if (!isNaN(newYear)) {
      setYear(newYear);
    }
  };

  return (
    <Select
      value={year.toString()}
      onValueChange={handleYearChange}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder={currentYear.toString()} />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y} value={y.toString()}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function YearSelector() {
  return (
    <Suspense fallback={<div className="w-[120px] h-10" />}>
      <YearSelectorInner />
    </Suspense>
  );
}
