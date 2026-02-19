import { expect, test } from 'vitest'
import { cn } from '@/lib/utils'
 
test('cn merges class names correctly', () => {
  expect(cn('w-full', 'h-full')).toBe('w-full h-full')
})
 
test('cn handles conditional classes', () => {
  expect(cn('w-full', true && 'bg-red-500', false && 'bg-blue-500')).toBe('w-full bg-red-500')
})
 
test('cn merges tailwind conflicts', () => {
  expect(cn('px-2 py-2', 'p-4')).toBe('p-4')
})
