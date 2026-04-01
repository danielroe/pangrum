export const useWord = () => useState('word', () => '')
export const useGuessHistory = () => useState<string[]>('guessHistory', () => [])
