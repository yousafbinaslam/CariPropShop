import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface UseApiOptions {
  immediate?: boolean;
  dependencies?: any[];
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<any>,
  args: any[] = [],
  options: UseApiOptions = {}
): UseApiResult<T> {
  const { immediate = true, dependencies = [] } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...executeArgs: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...executeArgs);
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Request failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => execute(...args);

  useEffect(() => {
    if (immediate) {
      execute(...args);
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refresh
  };
}

// Specific hooks for common operations
export function useProperties(filters?: any) {
  return useApi(
    () => apiClient.getProperties(filters),
    [],
    { dependencies: [filters] }
  );
}

export function useProperty(id: string) {
  return useApi(
    () => apiClient.getProperty(id),
    [id],
    { dependencies: [id], immediate: !!id }
  );
}

export function useClients(filters?: any) {
  return useApi(
    () => apiClient.getClients(filters),
    [],
    { dependencies: [filters] }
  );
}

export function useClient(id: string) {
  return useApi(
    () => apiClient.getClient(id),
    [id],
    { dependencies: [id], immediate: !!id }
  );
}

export function useAppointments(filters?: any) {
  return useApi(
    () => apiClient.getAppointments(filters),
    [],
    { dependencies: [filters] }
  );
}

export function usePayments(filters?: any) {
  return useApi(
    () => apiClient.getPayments(filters),
    [],
    { dependencies: [filters] }
  );
}

export function usePaymentAnalytics() {
  return useApi(() => apiClient.getPaymentAnalytics());
}