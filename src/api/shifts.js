import { apiFetch } from './client';
export function fetchWeek(weekId) {
    return apiFetch(`/api/schedule/week/${weekId}`);
}
export function fetchDay(date) {
    return apiFetch(`/api/schedule/day/${date}`);
}
export function updateShift(shift) {
    return apiFetch(`/api/shifts/${shift.id}`, {
        method: 'PUT',
        body: JSON.stringify(shift),
    });
}
