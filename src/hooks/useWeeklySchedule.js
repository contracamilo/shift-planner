import { useQuery } from '@tanstack/react-query';
import { fetchWeek } from '../api/shifts';
export function useWeeklySchedule(weekId) {
    return useQuery({
        queryKey: ['schedule', 'week', weekId],
        queryFn: () => fetchWeek(weekId),
    });
}
