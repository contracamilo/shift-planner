import type { DailySchedule, Shift, WeeklySchedule } from '../types';
import { apiFetch } from './client';

export function fetchWeek(weekId: string): Promise<WeeklySchedule> {
  return apiFetch<WeeklySchedule>(`/api/schedule/week/${weekId}`);
}

export function fetchDay(date: string): Promise<DailySchedule> {
  return apiFetch<DailySchedule>(`/api/schedule/day/${date}`);
}

export function updateShift(shift: Shift): Promise<Shift> {
  return apiFetch<Shift>(`/api/shifts/${shift.id}`, {
    method: 'PUT',
    body: JSON.stringify(shift),
  });
}
