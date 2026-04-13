import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
export const useEditorStore = create()(devtools((set) => ({
    isOpen: false,
    editing: null,
    open: (shift) => set({ isOpen: true, editing: shift }),
    close: () => set({ isOpen: false, editing: null }),
}), { name: 'editor-store' }));
