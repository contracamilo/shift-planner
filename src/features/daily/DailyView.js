import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDailySchedule } from '../../hooks/useDailySchedule';
import { useEditorStore } from '../../stores/editorStore';
export function DailyView({ date, onBack }) {
    const { data, isLoading, isError } = useDailySchedule(date);
    const openEditor = useEditorStore((s) => s.open);
    if (isLoading)
        return _jsx("p", { children: "Loading day\u2026" });
    if (isError || !data)
        return _jsx("p", { children: "Failed to load day." });
    return (_jsxs("section", { "aria-label": "daily-view", children: [_jsxs("header", { children: [_jsx("button", { onClick: onBack, children: "\u2190 Week" }), _jsx("h2", { children: date })] }), data.shifts.length === 0 ? (_jsx("p", { children: "No shifts today." })) : (_jsx("ul", { children: data.shifts.map((shift) => (_jsx("li", { children: _jsxs("button", { onClick: () => openEditor(shift), children: [shift.startTime, "\u2013", shift.endTime, " \u00B7 ", shift.employeeId] }) }, shift.id))) }))] }));
}
