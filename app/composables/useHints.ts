export function useHints() {
  const hintsEnabled = useLocalStorage<boolean>('glypher-hints-enabled', false, {
    initOnMounted: true,
  })

  function toggleHints() {
    hintsEnabled.value = !hintsEnabled.value
  }

  return {
    hintsEnabled: computed(() => hintsEnabled.value ?? false),
    toggleHints,
  }
}
