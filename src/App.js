import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { WeeklyView } from './features/weekly/WeeklyView';
import { DailyView } from './features/daily/DailyView';
import { ShiftEditorModal } from './features/editor/ShiftEditorModal';
import { WEEK_ID } from './mocks/data';
export function App() {
    const [route, setRoute] = useState({ kind: 'week' });
    return (_jsxs("main", { children: [_jsx("h1", { children: "Shift Planner" }), route.kind === 'week' ? (_jsx(WeeklyView, { weekId: WEEK_ID, onNavigateToDay: (date) => setRoute({ kind: 'day', date }) })) : (_jsx(DailyView, { date: route.date, onBack: () => setRoute({ kind: 'week' }) })), _jsx(ShiftEditorModal, {})] }));
}
