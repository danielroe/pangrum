interface Toast {
  message: string
}

export function addToast(toast: Toast) {
  const toasts = useToasts()
  toasts.value.push(toast)

  setTimeout(() => toasts.value.splice(toasts.value.indexOf(toast), 1), 500)
}

export const useToasts = () => useState<Toast[]>('toast', () => [])
