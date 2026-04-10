import { useDailySchedule } from '../../hooks/useDailySchedule';
import { useEditorStore } from '../../stores/editorStore';

interface Props {
  date: string;
  onBack: () => void;
}

export function DailyView({ date, onBack }: Props) {
  const { data, isLoading, isError } = useDailySchedule(date);
  const openEditor = useEditorStore((s) => s.open);

  if (isLoading) return <p>Loading day…</p>;
  if (isError || !data) return <p>Failed to load day.</p>;

  return (
    <section aria-label="daily-view">
      <header>
        <button onClick={onBack}>← Week</button>
        <h2>{date}</h2>
      </header>
      {data.shifts.length === 0 ? (
        <p>No shifts today.</p>
      ) : (
        <ul>
          {data.shifts.map((shift) => (
            <li key={shift.id}>
              <button onClick={() => openEditor(shift)}>
                {shift.startTime}–{shift.endTime} · {shift.employeeId}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
