import { useWeeklySchedule } from '../../hooks/useWeeklySchedule';
import { useEditorStore } from '../../stores/editorStore';
import { computeWeeklyHours } from '../../utils/hours';
import type { Shift } from '../../types';

interface Props {
  weekId: string;
  onNavigateToDay: (date: string) => void;
}

export function WeeklyView({ weekId, onNavigateToDay }: Props) {
  const { data, isLoading, isError } = useWeeklySchedule(weekId);
  const openEditor = useEditorStore((s) => s.open);

  if (isLoading) return <p>Loading week…</p>;
  if (isError || !data) return <p>Failed to load week.</p>;

  const byDate = groupByDate(data.shifts);
  const dates = Object.keys(byDate).sort();
  const totalHours = computeWeeklyHours(data.shifts);

  return (
    <section aria-label="weekly-view">
      <header>
        <h2>Week {weekId}</h2>
        <p data-testid="week-total-hours">Total hours: {totalHours}</p>
      </header>
      <ul>
        {dates.map((date) => (
          <li key={date}>
            <button onClick={() => onNavigateToDay(date)}>{date}</button>
            <ul>
              {byDate[date].map((shift) => (
                <li key={shift.id}>
                  <button
                    data-testid={`shift-${shift.id}`}
                    onClick={() => openEditor(shift)}
                  >
                    {shift.startTime}–{shift.endTime} · {shift.employeeId}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

function groupByDate(shifts: Shift[]): Record<string, Shift[]> {
  const out: Record<string, Shift[]> = {};
  for (const s of shifts) {
    (out[s.date] ??= []).push(s);
  }
  return out;
}
