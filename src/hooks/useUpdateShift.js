import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateShift as updateShiftApi } from '../api/shifts';
export function useUpdateShift() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateShiftApi,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['schedule', 'day', variables.date] });
            qc.invalidateQueries({ queryKey: ['schedule', 'week', variables.weekId] });
        },
    });
}
