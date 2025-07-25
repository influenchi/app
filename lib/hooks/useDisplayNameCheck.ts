import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface DisplayNameCheckResult {
  available: boolean | null;
  message: string;
  suggestions?: string[];
  isChecking: boolean;
}

export function useDisplayNameCheck(displayName: string, enabled: boolean = true) {
  const [result, setResult] = useState<DisplayNameCheckResult>({
    available: null,
    message: '',
    isChecking: false
  });

  const debouncedDisplayName = useDebounce(displayName, 500);

  const checkDisplayName = useCallback(async (name: string) => {
    if (!name || name.trim().length === 0) {
      setResult({
        available: null,
        message: '',
        isChecking: false
      });
      return;
    }

    if (name.trim().length < 3) {
      setResult({
        available: false,
        message: 'Display name must be at least 3 characters',
        isChecking: false
      });
      return;
    }

    setResult(prev => ({ ...prev, isChecking: true }));

    try {
      const response = await fetch(`/api/creator/check-display-name?displayName=${encodeURIComponent(name)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check display name');
      }

      setResult({
        available: data.available,
        message: data.message,
        suggestions: data.suggestions,
        isChecking: false
      });
    } catch (error) {
      console.error('Display name check error:', error);
      setResult({
        available: null,
        message: 'Failed to check availability',
        isChecking: false
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setResult({
        available: null,
        message: '',
        isChecking: false
      });
      return;
    }

    checkDisplayName(debouncedDisplayName);
  }, [debouncedDisplayName, checkDisplayName, enabled]);

  return result;
} 