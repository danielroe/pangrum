interface Toast {
  message: string
  type?: 'success' | 'error' | 'info' | 'celebration'
  duration?: number
}

export function addToast(toast: Toast) {
  const toasts = useToasts()
  const duration = toast.duration ?? (toast.type === 'celebration' ? 2000 : toast.type === 'error' ? 1500 : 1000)

  toasts.value.push(toast)

  setTimeout(() => toasts.value.splice(toasts.value.indexOf(toast), 1), duration)
}

export const useToasts = () => useState<Toast[]>('toast', () => [])
