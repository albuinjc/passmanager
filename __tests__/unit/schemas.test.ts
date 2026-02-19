import { expect, test, describe } from 'vitest'
import { credentialSchema, userSchema } from '@/lib/schemas'

describe('Credential Schema', () => {
    test('validates correct credential data', () => {
        const validData = {
            title: 'My Bank',
            username: 'user@example.com',
            password: 'securePassword123!',
            url: 'https://bank.com',
            two_fa_seed: 'JBSWY3DPEHPK3PXP' // Valid Base32
        }
        const result = credentialSchema.safeParse(validData)
        expect(result.success).toBe(true)
    })

    test('validates correct credential data without optional fields', () => {
        const validData = {
            title: 'My Bank',
            username: 'user@example.com',
            password: 'securePassword123!',
            url: 'https://bank.com',
        }
        const result = credentialSchema.safeParse(validData)
        expect(result.success).toBe(true)
    })

    test('fails on invalid URL', () => {
        const invalidData = {
            title: 'My Bank',
            username: 'user',
            password: 'pw',
            url: 'not-a-url',
        }
        const result = credentialSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.url).toContain('Invalid URL')
        }
    })

    test('fails on missing required fields', () => {
        const invalidData = {
            description: 'Just a description'
        }
        const result = credentialSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors
            expect(errors.title).toBeDefined()
            expect(errors.username).toBeDefined()
            expect(errors.password).toBeDefined()
            expect(errors.url).toBeDefined()
        }
    })

    test('fails on invalid TOTP seed (non-Base32)', () => {
        const invalidData = {
            title: 'Test',
            username: 'user',
            password: 'pw',
            url: 'https://test.com',
            two_fa_seed: '182' // Invalid chars (1, 8) and too short
        }
        const result = credentialSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.two_fa_seed).toBeDefined()
        }
    })
})

describe('User Schema', () => {
    test('validates correct Admin user', () => {
        const validUser = {
            name: 'Admin User',
            email: 'admin@corp.com',
            role: 'Admin',
            active: true
        }
        const result = userSchema.safeParse(validUser)
        expect(result.success).toBe(true)
    })

    test('fails on invalid email', () => {
        const invalidUser = {
            name: 'User',
            email: 'not-email',
            role: 'Viewer',
            active: true
        }
        const result = userSchema.safeParse(invalidUser)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.email).toContain('Invalid email address')
        }
    })

    test('fails on short name', () => {
        const invalidUser = {
            name: 'A',
            email: 'a@b.com',
            role: 'Viewer',
            active: true
        }
        const result = userSchema.safeParse(invalidUser)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.name).toBeDefined()
        }
    })
})
