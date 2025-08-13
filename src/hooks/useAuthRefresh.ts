import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook that triggers a refresh function whenever authentication state changes.
 * This provides a clean, reusable way for any component to automatically refresh
 * when users log in or out, without needing to manually handle auth state.
 * 
 * @param refreshFunction - Function to call when auth state changes
 * @param dependencies - Additional dependencies for the useEffect
 */
export const useAuthRefresh = (
  refreshFunction: () => void | Promise<void>,
  dependencies: any[] = []
) => {
  const { refreshTrigger } = useAuth();

  useEffect(() => {
    refreshFunction();
  }, [refreshTrigger, ...dependencies]);
};
