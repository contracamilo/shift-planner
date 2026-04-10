import { useState } from 'react';
import { WeeklyView } from './features/weekly/WeeklyView';
import { DailyView } from './features/daily/DailyView';
import { ShiftEditorModal } from './features/editor/ShiftEditorModal';
import { WEEK_ID } from './mocks/data';

type Route =
  | { kind: 'week' }
  | { kind: 'day'; date: string };

export function App() {
  const [route, setRoute] = useState<Route>({ kind: 'week' });

  return (
    <main>
      <h1>Shift Planner</h1>
      {route.kind === 'week' ? (
        <WeeklyView
          weekId={WEEK_ID}
          onNavigateToDay={(date) => setRoute({ kind: 'day', date })}
        />
      ) : (
        <DailyView
          date={route.date}
          onBack={() => setRoute({ kind: 'week' })}
        />
      )}
      <ShiftEditorModal />
    </main>
  );
}
