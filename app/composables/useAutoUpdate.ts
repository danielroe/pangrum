export function useAutoUpdate() {
  const { $pwa } = useNuxtApp()
  const word = useWord()

  if (!$pwa) return

  const reloadWhenReady = () => {
    if ($pwa.needRefresh && !word.value) {
      window.location.reload()
    }
  }

  watch(() => $pwa.needRefresh, reloadWhenReady, { immediate: true })
  watch(word, reloadWhenReady)
}
