import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateShift as updateShiftApi } from '../api/shifts';
export function useUpdateShift() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateShiftApi,
        onSuccess: () => {
            // Invalida todas las vistas de schedule (diaria, semanal, futuras).
            qc.invalidateQueries({ queryKey: ['schedule'] });
        },
    });
}
