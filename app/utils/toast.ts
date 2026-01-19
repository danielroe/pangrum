export type ToastType = 'success' | 'error' | 'info' | 'celebration'

export interface Toast {
  message: string
  type?: ToastType
  duration?: number
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  celebration: 2000,
  error: 1500,
  success: 1000,
  info: 1000,
}

export function getToastDuration(type?: ToastType): number {
  return DEFAULT_DURATIONS[type ?? 'info']
}

export function addToast(toast: Toast) {
  const toasts = useToasts()
  const duration = toast.duration ?? getToastDuration(toast.type)

  toasts.value.push(toast)

  setTimeout(() => {
    const index = toasts.value.indexOf(toast)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }, duration)
}

export const useToasts = () => useState<Toast[]>('toast', () => [])
