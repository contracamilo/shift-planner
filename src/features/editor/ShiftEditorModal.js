import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { useUpdateShift } from '../../hooks/useUpdateShift';
export function ShiftEditorModal() {
    const isOpen = useEditorStore((s) => s.isOpen);
    const editing = useEditorStore((s) => s.editing);
    const close = useEditorStore((s) => s.close);
    const updateShift = useUpdateShift();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    useEffect(() => {
        if (editing) {
            setStartTime(editing.startTime);
            setEndTime(editing.endTime);
            setNotes(editing.notes ?? '');
        }
    }, [editing]);
    if (!isOpen || !editing)
        return null;
    const handleSave = () => {
        updateShift.mutate({ ...editing, startTime, endTime, notes }, { onSuccess: () => close() });
    };
    return (_jsxs("div", { role: "dialog", "aria-label": "shift-editor", children: [_jsxs("h3", { children: ["Edit shift ", editing.id] }), _jsxs("label", { children: ["Start", _jsx("input", { type: "time", value: startTime, onChange: (e) => setStartTime(e.target.value) })] }), _jsxs("label", { children: ["End", _jsx("input", { type: "time", value: endTime, onChange: (e) => setEndTime(e.target.value) })] }), _jsxs("label", { children: ["Notes", _jsx("input", { value: notes, onChange: (e) => setNotes(e.target.value) })] }), _jsxs("div", { children: [_jsx("button", { onClick: close, children: "Cancel" }), _jsx("button", { onClick: handleSave, disabled: updateShift.isPending, children: updateShift.isPending ? 'Saving…' : 'Save' })] })] }));
}
