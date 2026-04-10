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

  if (!isOpen || !editing) return null;

  const handleSave = () => {
    updateShift.mutate(
      { ...editing, startTime, endTime, notes },
      { onSuccess: () => close() },
    );
  };

  return (
    <div role="dialog" aria-label="shift-editor">
      <h3>Edit shift {editing.id}</h3>
      <label>
        Start
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </label>
      <label>
        End
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </label>
      <label>
        Notes
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div>
        <button onClick={close}>Cancel</button>
        <button onClick={handleSave} disabled={updateShift.isPending}>
          {updateShift.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
