export interface NotificationSettings {
  enabled: boolean
  time: string // HH:MM format
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  time: '09:00',
}

export function useNotificationSettings() {
  return useLocalStorage<NotificationSettings>('pangrum-notifications', DEFAULT_SETTINGS, {
    initOnMounted: true,
  })
}

export function useNotificationPermission() {
  const permission = ref<NotificationPermission>('default')

  const updatePermission = () => {
    if ('Notification' in window) {
      permission.value = Notification.permission
    }
  }

  onMounted(updatePermission)

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return 'denied' as NotificationPermission
    }

    const result = await Notification.requestPermission()
    permission.value = result
    return result
  }

  return {
    permission,
    requestPermission,
    isSupported: computed(() => 'Notification' in (typeof window !== 'undefined' ? window : {})),
  }
}

export function useNotifications() {
  const settings = useNotificationSettings()
  const { permission, requestPermission, isSupported } = useNotificationPermission()

  const canNotify = computed(() =>
    isSupported.value && permission.value === 'granted' && settings.value.enabled,
  )

  const enableNotifications = async () => {
    if (!isSupported.value) return false

    const result = await requestPermission()
    if (result === 'granted') {
      settings.value.enabled = true
      scheduleNotification()
      return true
    }
    return false
  }

  const disableNotifications = () => {
    settings.value.enabled = false
  }

  const setNotificationTime = (time: string) => {
    settings.value.time = time
    if (canNotify.value) {
      scheduleNotification()
    }
  }

  const scheduleNotification = () => {
    if (!canNotify.value) return

    if ('serviceWorker' in navigator && 'periodicSync' in (navigator.serviceWorker as unknown as { periodicSync?: unknown })) {
      registerPeriodicSync()
    }
  }

  const registerPeriodicSync = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      // @ts-expect-error - periodicSync is not in the standard types yet
      if (registration.periodicSync) {
        // @ts-expect-error - periodicSync is not in the standard types yet
        await registration.periodicSync.register('daily-puzzle-reminder', {
          minInterval: 24 * 60 * 60 * 1000, // 24 hours
        })
      }
    }
    catch {
      // Periodic sync not available or permission denied
    }
  }

  const showNotification = async (title: string, options?: NotificationOptions) => {
    if (!canNotify.value) return

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'pangrum-daily',
        ...options,
      })
    }
    catch {
      if (permission.value === 'granted') {
        new Notification(title, options)
      }
    }
  }

  function checkAndNotify() {
    if (!canNotify.value) return

    const lastNotified = localStorage.getItem('pangrum-last-notified')
    const today = new Date().toISOString().slice(0, 10)

    if (lastNotified !== today) {
      const [hoursStr, minutesStr] = settings.value.time.split(':')
      const hours = Number(hoursStr) || 9
      const minutes = Number(minutesStr) || 0
      const now = new Date()
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)

      if (now >= scheduledTime) {
        localStorage.setItem('pangrum-last-notified', today)
      }
    }
  }

  onMounted(checkAndNotify)

  return {
    settings,
    permission,
    isSupported,
    canNotify,
    enableNotifications,
    disableNotifications,
    setNotificationTime,
    showNotification,
  }
}
