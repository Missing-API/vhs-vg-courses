import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// extends Vitest's expect method with methods from react-testing-library
// @ts-expect-error - global augmentation
global.expect = expect

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})
