import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateShift as updateShiftApi } from '../api/shifts';
export function useUpdateShift() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateShiftApi,
        onSuccess: (_data, variables) => {
            // Solo invalida la vista diaria.
            qc.invalidateQueries({ queryKey: ['schedule', 'day', variables.date] });
            // BUG: falta invalidar la vista semanal.
            // qc.invalidateQueries({ queryKey: ['schedule', 'week', variables.weekId] });
        },
    });
}
