// @vitest-environment node
import { expect, test, describe } from 'vitest'
import { validateTotpSeed } from '@/lib/totp-utils'

describe('TOTP Utils', () => {
    test('validates correct Base32 seed', async () => {
        const validSeed = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'
        const isValid = await validateTotpSeed(validSeed)
        expect(isValid).toBe(true)
    })

    test('rejects short seed', async () => {
        const shortSeed = 'ABC'
        const isValid = await validateTotpSeed(shortSeed)
        expect(isValid).toBe(false)
    })

    test('rejects invalid Base32 characters if otplib fails generation', async () => {
         // If otplib throws on invalid chars, it returns false.
         const invalidSeed = '1818181818181818' 
         const isValid = await validateTotpSeed(invalidSeed)
         expect(isValid).toBe(false)
    })

    test('accepts empty seed (optional)', async () => {
        const isValid = await validateTotpSeed('')
        expect(isValid).toBe(true)
    })
})
