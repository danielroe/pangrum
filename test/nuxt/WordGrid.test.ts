import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { WordGrid } from '#components'

describe('WordGrid', () => {
  const defaultProps = {
    validWords: ['TEST', 'TESTS', 'TENT', 'TASTE', 'TASTING'],
    words: new Set<string>(),
    letters: ['T', 'E', 'S', 'A', 'I', 'N', 'G'],
  }

  describe('rendering', () => {
    it('renders the hint panel', async () => {
      const component = await mountSuspended(WordGrid, {
        props: defaultProps,
      })

      const panel = component.find('.hint-panel')
      expect(panel.exists()).toBe(true)
    })

    it('renders header with title', async () => {
      const component = await mountSuspended(WordGrid, {
        props: defaultProps,
      })

      const header = component.find('.hint-panel-header')
      expect(header.exists()).toBe(true)
    })

    it('displays found/total count', async () => {
      const component = await mountSuspended(WordGrid, {
        props: {
          ...defaultProps,
          words: new Set(['TEST', 'TENT']),
        },
      })

      // Should show 2/5 (2 found out of 5 total)
      const countText = component.find('.tabular-nums.ml-auto')
      expect(countText.text()).toContain('2')
      expect(countText.text()).toContain('5')
    })

    it('renders table for word grid', async () => {
      const component = await mountSuspended(WordGrid, {
        props: defaultProps,
      })

      const table = component.find('table')
      expect(table.exists()).toBe(true)
    })
  })

  describe('grid structure', () => {
    it('creates rows for each unique prefix', async () => {
      const component = await mountSuspended(WordGrid, {
        props: {
          ...defaultProps,
          validWords: ['TEST', 'TENT', 'APPLE', 'ANT'],
        },
      })

      // Should have rows for T and A prefixes
      const rows = component.findAll('tbody tr')
      // First row is header, then T row, A row
      expect(rows.length).toBeGreaterThanOrEqual(2)
    })

    it('shows prefix letters in row headers', async () => {
      const component = await mountSuspended(WordGrid, {
        props: defaultProps,
      })

      const prefixButtons = component.findAll('tbody tr td:first-child button')
      const prefixTexts = prefixButtons.map(b => b.text().toUpperCase())

      // All test words start with T
      expect(prefixTexts).toContain('T')
    })

    it('shows length numbers in column headers', async () => {
      const component = await mountSuspended(WordGrid, {
        props: defaultProps,
      })

      // Header row should have length numbers (4, 5, 6, 7)
      const headerButtons = component.findAll('tbody tr:first-child td button')
      const lengths = headerButtons.map(b => Number.parseInt(b.text()))

      expect(lengths).toContain(4)
      expect(lengths).toContain(5)
    })
  })

  describe('remaining counts', () => {
    it('shows remaining count in cells', async () => {
      const component = await mountSuspended(WordGrid, {
        props: {
          ...defaultProps,
          validWords: ['TEST', 'TENT'], // Two 4-letter words
          words: new Set<string>(),
        },
      })

      // Find cell with count
      const cells = component.findAll('.grid-cell button')
      const cellWithCount = cells.find(c => c.text() === '2')
      expect(cellWithCount).toBeDefined()
    })

    it('shows checkmark when all words of that type found', async () => {
      const component = await mountSuspended(WordGrid, {
        props: {
          ...defaultProps,
          validWords: ['TEST', 'TENT'],
          words: new Set(['TEST', 'TENT']), // All found
        },
      })

      // Should have checkmark icon
      const checkmarks = component.findAll('.i-lucide-check')
      expect(checkmarks.length).toBeGreaterThan(0)
    })

    it('updates count when word is found', async () => {
      const props = {
        ...defaultProps,
        validWords: ['TEST', 'TENT'],
        words: new Set<string>(),
      }

      const component = await mountSuspended(WordGrid, { props })

      // Initially should show 2
      let cells = component.findAll('.grid-cell button')
      expect(cells.some(c => c.text() === '2')).toBe(true)

      // Update with one word found
      await component.setProps({
        ...props,
        words: new Set(['TEST']),
      })

      // Now should show 1
      cells = component.findAll('.grid-cell button')
      expect(cells.some(c => c.text() === '1')).toBe(true)
    })
  })

  describe('emitted events', () => {
    it('emits showPrefixStats when prefix is clicked', async () => {
      const component = await mountSuspended(WordGrid, {
        props: defaultProps,
      })

      // Click on a prefix button
      const prefixButton = component.find('tbody tr:not(:first-child) td:first-child button')
      await prefixButton.trigger('click')

      expect(component.emitted('showPrefixStats')).toBeDefined()
      expect(component.emitted('showPrefixStats')![0]).toEqual(['T'])
    })

    it('emits showLengthStats when length header is clicked', async () => {
      const component = await mountSuspended(WordGrid, {
        props: defaultProps,
      })

      // Click on a length header button
      const lengthButtons = component.findAll('tbody tr:first-child td button')
      const fourButton = lengthButtons.find(b => b.text() === '4')

      if (fourButton) {
        await fourButton.trigger('click')

        expect(component.emitted('showLengthStats')).toBeDefined()
        expect(component.emitted('showLengthStats')![0]).toEqual([4])
      }
    })

    it('emits showGridStats when grid cell is clicked', async () => {
      const component = await mountSuspended(WordGrid, {
        props: defaultProps,
      })

      // Click on a grid cell (not a checkmark, one with a number)
      const gridCells = component.findAll('.grid-cell button')
      const cellWithNumber = gridCells.find(c => /^\d+$/.test(c.text()))

      if (cellWithNumber) {
        await cellWithNumber.trigger('click')

        expect(component.emitted('showGridStats')).toBeDefined()
        // Should emit [prefix, length]
        const emitted = component.emitted('showGridStats')![0]
        expect(emitted).toHaveLength(2)
        expect(typeof emitted![0]).toBe('string') // prefix
        expect(typeof emitted![1]).toBe('number') // length
      }
    })
  })

  describe('computed properties', () => {
    it('calculates longest word length correctly', async () => {
      const component = await mountSuspended(WordGrid, {
        props: {
          ...defaultProps,
          validWords: ['TEST', 'TESTING', 'TESTINGS'], // 4, 7, 8 letters
        },
      })

      // Should have columns up to 8
      const headerButtons = component.findAll('tbody tr:first-child td button')
      const lengths = headerButtons.map(b => Number.parseInt(b.text()))
      expect(Math.max(...lengths)).toBe(8)
    })

    it('groups words by prefix correctly', async () => {
      const component = await mountSuspended(WordGrid, {
        props: {
          ...defaultProps,
          validWords: ['TEST', 'TENT', 'APPLE', 'ANT', 'ANTI'],
        },
      })

      const prefixButtons = component.findAll('tbody tr:not(:first-child) td:first-child button')
      const prefixes = prefixButtons.map(b => b.text().toUpperCase())

      expect(prefixes).toContain('T')
      expect(prefixes).toContain('A')
    })
  })
})
