import { useQuery } from '@tanstack/react-query';
import { fetchWeek } from '../api/shifts';

export function useWeeklySchedule(weekId: string) {
  return useQuery({
    queryKey: ['schedule', 'week', weekId],
    queryFn: () => fetchWeek(weekId),
  });
}
