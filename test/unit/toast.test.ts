import { describe, expect, it } from 'vitest'
import { getToastDuration } from '../../app/utils/toast'

describe('getToastDuration', () => {
  it('returns 2000ms for celebration toasts', () => {
    expect(getToastDuration('celebration')).toBe(2000)
  })

  it('returns 1500ms for error toasts', () => {
    expect(getToastDuration('error')).toBe(1500)
  })

  it('returns 1000ms for success toasts', () => {
    expect(getToastDuration('success')).toBe(1000)
  })

  it('returns 1000ms for info toasts', () => {
    expect(getToastDuration('info')).toBe(1000)
  })

  it('returns 1000ms when no type specified', () => {
    expect(getToastDuration()).toBe(1000)
    expect(getToastDuration(undefined)).toBe(1000)
  })
})
