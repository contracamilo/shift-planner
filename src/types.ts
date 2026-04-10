export type EmployeeId = string;
export type ShiftId = string;

export interface Employee {
  id: EmployeeId;
  name: string;
  role: 'barista' | 'cashier' | 'manager';
}

export interface Shift {
  id: ShiftId;
  employeeId: EmployeeId;
  /** ISO date, e.g. "2026-04-13" (Monday of that week). */
  date: string;
  /** ISO week identifier, e.g. "2026-W15". */
  weekId: string;
  /** "HH:MM" 24h. */
  startTime: string;
  /** "HH:MM" 24h. */
  endTime: string;
  notes?: string;
}

export interface WeeklySchedule {
  weekId: string;
  shifts: Shift[];
}

export interface DailySchedule {
  date: string;
  shifts: Shift[];
}
