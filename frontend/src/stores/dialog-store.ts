import { create } from 'zustand'

export type DialogType =
  | 'new-folder'
  | 'connect-drive'
  | 's3-config'
  | 'rename'
  | 'move'
  | 'editor'
  | 'share'
  | 'delete'
  | 'storage-breakdown'

interface DialogState {
  activeDialog: DialogType | null
  dialogData: Record<string, unknown> | null

  openDialog: (type: DialogType, data?: Record<string, unknown>) => void
  closeDialog: () => void
}

export const useDialogStore = create<DialogState>((set) => ({
  activeDialog: null,
  dialogData: null,

  openDialog: (type, data = {}) => set({ activeDialog: type, dialogData: data }),
  closeDialog: () => set({ activeDialog: null, dialogData: null }),
}))

