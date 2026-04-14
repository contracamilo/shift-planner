import { http, HttpResponse, delay } from 'msw';
import type { Shift } from '../types';
import { employees, shifts, WEEK_ID } from './data';

// In-memory snapshot so PUTs persist across GETs during a session.
const currentShifts: Shift[] = shifts.map((s) => ({ ...s }));

export const handlers = [
  http.get('/api/employees', async () => {
    await delay(30);
    return HttpResponse.json(employees);
  }),

  http.get('/api/schedule/week/:weekId', async ({ params }) => {
    await delay(40);
    const weekId = params.weekId as string;
    const weekShifts = currentShifts.filter((s) => s.weekId === weekId);
    return HttpResponse.json({ weekId, shifts: weekShifts });
  }),

  http.get('/api/schedule/day/:date', async ({ params }) => {
    await delay(40);
    const date = params.date as string;
    const dayShifts = currentShifts.filter((s) => s.date === date);
    return HttpResponse.json({ date, shifts: dayShifts });
  }),

  http.put('/api/shifts/:id', async ({ request, params }) => {
    const payload = (await request.json()) as Shift;
    const id = params.id as string;
    const idx = currentShifts.findIndex((s) => s.id === id);
    if (idx >= 0) {
      currentShifts[idx] = { ...currentShifts[idx], ...payload };
    }
    await delay(50 + Math.random() * 80);
    return HttpResponse.json(payload);
  }),
];

export const seedWeekId = WEEK_ID;
