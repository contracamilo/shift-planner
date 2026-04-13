import { useQuery } from '@tanstack/react-query';
import { fetchDay } from '../api/shifts';
export function useDailySchedule(date) {
    return useQuery({
        queryKey: ['schedule', 'day', date],
        queryFn: () => fetchDay(date),
    });
}
