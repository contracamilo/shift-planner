import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useWeeklySchedule } from '../../hooks/useWeeklySchedule';
import { useEditorStore } from '../../stores/editorStore';
import { computeWeeklyHours } from '../../utils/hours';
export function WeeklyView({ weekId, onNavigateToDay }) {
    const { data, isLoading, isError } = useWeeklySchedule(weekId);
    const openEditor = useEditorStore((s) => s.open);
    if (isLoading)
        return _jsx("p", { children: "Loading week\u2026" });
    if (isError || !data)
        return _jsx("p", { children: "Failed to load week." });
    const byDate = groupByDate(data.shifts);
    const dates = Object.keys(byDate).sort();
    const totalHours = computeWeeklyHours(data.shifts);
    return (_jsxs("section", { "aria-label": "weekly-view", children: [_jsxs("header", { children: [_jsxs("h2", { children: ["Week ", weekId] }), _jsxs("p", { "data-testid": "week-total-hours", children: ["Total hours: ", totalHours] })] }), _jsx("ul", { children: dates.map((date) => (_jsxs("li", { children: [_jsx("button", { onClick: () => onNavigateToDay(date), children: date }), _jsx("ul", { children: byDate[date].map((shift) => (_jsx("li", { children: _jsxs("button", { "data-testid": `shift-${shift.id}`, onClick: () => openEditor(shift), children: [shift.startTime, "\u2013", shift.endTime, " \u00B7 ", shift.employeeId] }) }, shift.id))) })] }, date))) })] }));
}
function groupByDate(shifts) {
    const out = {};
    for (const s of shifts) {
        (out[s.date] ??= []).push(s);
    }
    return out;
}
