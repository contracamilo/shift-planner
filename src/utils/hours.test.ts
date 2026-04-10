import { describe, expect, it } from 'vitest';
import { computeWeeklyHours } from './hours';
import type { Shift } from '../types';

function shift(startTime: string, endTime: string): Shift {
  return {
    id: 'x',
    employeeId: 'e1',
    date: '2026-04-13',
    weekId: '2026-W15',
    startTime,
    endTime,
  };
}

describe('computeWeeklyHours', () => {
  it('9:00→17:00 es 8 horas brutas', () => {
    expect(computeWeeklyHours([shift('09:00', '17:00')])).toBe(8);
  });

  it('suma varios turnos', () => {
    const shifts = [
      shift('09:00', '13:00'), // 4h
      shift('14:00', '18:00'), // 4h
    ];
    expect(computeWeeklyHours(shifts)).toBe(8);
  });

  it('tolera minutos fraccionales', () => {
    expect(computeWeeklyHours([shift('09:00', '09:30')])).toBe(0.5);
  });
});
