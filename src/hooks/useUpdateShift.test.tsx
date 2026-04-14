import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import type { Shift } from '../types';
import { useUpdateShift } from './useUpdateShift';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient };
}

const mockShift: Shift = {
  id: 's1',
  employeeId: 'e1',
  date: '2026-04-13',
  weekId: '2026-W15',
  startTime: '09:00',
  endTime: '17:00',
};

describe('useUpdateShift', () => {
  it('invalida todas las queries de schedule al mutar', async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateShift(), { wrapper });

    result.current.mutate(mockShift);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['schedule'] });
  });

  it('no invalida queries no relacionadas con schedule', async () => {
    const { wrapper, queryClient } = createWrapper();

    // Poblar cache con query ajena
    queryClient.setQueryData(['employees'], [{ id: 'e1', name: 'Alice' }]);

    const { result } = renderHook(() => useUpdateShift(), { wrapper });

    result.current.mutate(mockShift);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // La query de employees debe seguir en cache
    expect(queryClient.getQueryData(['employees'])).toEqual([
      { id: 'e1', name: 'Alice' },
    ]);
  });
});
