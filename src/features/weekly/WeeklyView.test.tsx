import { describe, expect, it } from 'vitest';
import { updateShift } from '../../api/shifts';
import type { Shift } from '../../types';

/**
 * Test que expone el Bug 2: race en el handler de PUT /api/shifts/:id.
 *
 * Dispara dos updateShift casi simultáneos. El handler comparte
 * `lastUpdated` en un closure, así que la respuesta del primero puede
 * venir con el payload del segundo — falla de forma intermitente.
 */
describe('WeeklyView — concurrent shift updates', () => {
  it('la respuesta de un PUT refleja su propio payload', async () => {
    const a: Shift = {
      id: 's1',
      employeeId: 'e1',
      date: '2026-04-13',
      weekId: '2026-W15',
      startTime: '09:00',
      endTime: '17:00',
      notes: 'A',
    };
    const b: Shift = {
      id: 's2',
      employeeId: 'e2',
      date: '2026-04-13',
      weekId: '2026-W15',
      startTime: '08:00',
      endTime: '14:00',
      notes: 'B',
    };

    const [resA, resB] = await Promise.all([updateShift(a), updateShift(b)]);

    expect(resA.id).toBe('s1');
    expect(resA.notes).toBe('A');
    expect(resB.id).toBe('s2');
    expect(resB.notes).toBe('B');
  });
});
