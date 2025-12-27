"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { getBowlYear } from '@/lib/utils';

interface YearContextType {
  year: number;
  setYear: (year: number) => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentYear = getBowlYear();
  
  // Get year from URL params or default to current year
  const urlYear = searchParams.get('year');
  const initialYear = urlYear ? parseInt(urlYear, 10) : currentYear;
  
  const [year, setYearState] = useState<number>(initialYear);

  // Sync URL when year changes
  const setYear = (newYear: number) => {
    setYearState(newYear);
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', newYear.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Sync state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlYear = searchParams.get('year');
    if (urlYear) {
      const parsedYear = parseInt(urlYear, 10);
      if (!isNaN(parsedYear) && parsedYear !== year) {
        setYearState(parsedYear);
      }
    } else if (year !== currentYear) {
      // If no year in URL and state doesn't match current year, sync to current year
      setYearState(currentYear);
    }
  }, [searchParams, currentYear, year]);

  return (
    <YearContext.Provider value={{ year, setYear }}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
}

