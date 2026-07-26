import { useEffect, useState } from 'react';

export type ViewMode = 'thumbnail' | 'list';

const STORAGE_KEY = 'ps_view_mode';

// Persisted in localStorage and shared across pages, so switching to list
// view on one page keeps it that way when navigating to another.
export function useViewMode(defaultMode: ViewMode = 'thumbnail') {
  const [mode, setMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'list' || stored === 'thumbnail' ? stored : defaultMode;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return [mode, setMode] as const;
}
