import { create } from 'zustand'
import { api, formatApiError } from '@/lib/api'
import { useAccountStore } from './account-store'

export interface UploadTask {
  id: string
  file: File
  fileName: string
  sizeBytes: number
  mimeType: string
  folderId: string | null
  status: 'queued' | 'uploading' | 'completed' | 'error' | 'canceled'
  progress: number // 0 to 100
  uploadedBytes: number
  speedBytesPerSec: number
  error?: string
  sessionId?: string
  abortController?: AbortController
}

interface UploadState {
  tasks: UploadTask[]
  isTrayOpen: boolean
  isMinimized: boolean

  addFiles: (files: File[], folderId?: string | null) => void
  cancelUpload: (id: string) => void
  clearCompleted: () => void
  toggleMinimized: () => void
  setTrayOpen: (open: boolean) => void
}

const RESUMABLE_THRESHOLD = 10 * 1024 * 1024 // 10MB
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

export const useUploadStore = create<UploadState>((set, get) => ({
  tasks: [],
  isTrayOpen: false,
  isMinimized: false,

  addFiles: (files, folderId = null) => {
    if (files.length === 0) return

    const newTasks: UploadTask[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      fileName: file.name,
      sizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      folderId,
      status: 'queued',
      progress: 0,
      uploadedBytes: 0,
      speedBytesPerSec: 0,
      abortController: new AbortController(),
    }))

    set((state) => ({
      tasks: [...state.tasks, ...newTasks],
      isTrayOpen: true,
      isMinimized: false,
    }))

    // Start processing queued tasks
    newTasks.forEach((task) => {
      void processTask(task.id)
    })
  },

  cancelUpload: (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (task?.abortController) {
      task.abortController.abort()
    }
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status: 'canceled' } : t)),
    }))
  },

  clearCompleted: () => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.status !== 'completed' && t.status !== 'canceled'),
      isTrayOpen: state.tasks.some((t) => t.status === 'uploading' || t.status === 'queued'),
    }))
  },

  toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),
  setTrayOpen: (isTrayOpen) => set({ isTrayOpen }),
}))

async function processTask(taskId: string) {
  const store = useUploadStore.getState()
  const task = store.tasks.find((t) => t.id === taskId)
  if (!task || task.status === 'canceled') return

  useUploadStore.setState((state) => ({
    tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'uploading' } : t)),
  }))

  const startTime = Date.now()
  let lastLoaded = 0

  const updateProgress = (loaded: number, total: number) => {
    const elapsedSec = (Date.now() - startTime) / 1000
    const speed = elapsedSec > 0 ? (loaded - lastLoaded) / elapsedSec : 0
    lastLoaded = loaded
    const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0

    useUploadStore.setState((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              progress: percent,
              uploadedBytes: loaded,
              speedBytesPerSec: speed,
            }
          : t
      ),
    }))
  }

  try {
    if (task.sizeBytes <= RESUMABLE_THRESHOLD) {
      // 1. Standard Multipart Stream
      const formData = new FormData()
      formData.append('sizeBytes', String(task.sizeBytes))
      formData.append('fileName', task.fileName)
      formData.append('mimeType', task.mimeType)
      if (task.folderId) formData.append('folderId', task.folderId)
      formData.append('file', task.file, task.fileName)

      await api.post('/uploads', formData, {
        signal: task.abortController?.signal,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            updateProgress(progressEvent.loaded, progressEvent.total)
          }
        },
      })
    } else {
      // 2. High-Speed Resumable Chunked Upload (5MB slices)
      const initRes = await api.post(
        '/uploads/resumable/init',
        {
          fileName: task.fileName,
          mimeType: task.mimeType,
          sizeBytes: String(task.sizeBytes),
          folderId: task.folderId,
        },
        { signal: task.abortController?.signal }
      )

      const sessionId = initRes.data?.sessionId
      if (!sessionId) throw new Error('Resumable session failed to initialize.')

      useUploadStore.setState((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, sessionId } : t)),
      }))

      let offset = 0
      while (offset < task.sizeBytes) {
        const currentTask = useUploadStore.getState().tasks.find((t) => t.id === taskId)
        if (currentTask?.status === 'canceled') break

        const end = Math.min(offset + CHUNK_SIZE, task.sizeBytes)
        const chunk = task.file.slice(offset, end)

        await api.put(`/uploads/resumable/chunk/${sessionId}`, chunk, {
          signal: task.abortController?.signal,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Range': `bytes ${offset}-${end - 1}/${task.sizeBytes}`,
            'Content-Length': String(chunk.size),
          },
        })

        offset = end
        updateProgress(offset, task.sizeBytes)
      }
    }

    useUploadStore.setState((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'completed',
              progress: 100,
              uploadedBytes: t.sizeBytes,
              speedBytesPerSec: 0,
            }
          : t
      ),
    }))

    // Refresh views and quota
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('drivesync-refresh-items'))
    }
    useAccountStore.getState().fetchAccountsAndStorage()
  } catch (err: unknown) {
    const errorMsg = formatApiError(err, 'Upload failed.')
    useUploadStore.setState((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'error',
              error: errorMsg,
              speedBytesPerSec: 0,
            }
          : t
      ),
    }))
  }
}
