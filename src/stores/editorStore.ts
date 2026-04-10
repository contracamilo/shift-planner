import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Shift } from '../types';

interface EditorState {
  isOpen: boolean;
  editing: Shift | null;
  open: (shift: Shift) => void;
  close: () => void;
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set) => ({
      isOpen: false,
      editing: null,
      open: (shift) => set({ isOpen: true, editing: shift }),
      close: () => set({ isOpen: false, editing: null }),
    }),
    { name: 'editor-store' },
  ),
);
