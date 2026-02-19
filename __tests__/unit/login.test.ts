import { expect, test, describe, vi, beforeEach } from 'vitest'
import { login } from '@/app/auth/actions'
import { redirect } from 'next/navigation'

// Mock Supabase Client
const mockSupabase = {
    auth: {
        signInWithPassword: vi.fn(),
        getUser: vi.fn(),
        signOut: vi.fn(),
    },
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                single: vi.fn(),
            })),
        })),
    })),
}

vi.mock('@/lib/supabase-server', () => ({
    createClient: vi.fn(() => mockSupabase),
}))

// Mock Next.js navigation and cache
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Login Action', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('successfully logins and redirects active user', async () => {
        // Mock success sign in
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })
        
        // Mock active user check
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
        
        // Mock profile active=true
        const mockSingle = vi.fn().mockResolvedValue({ data: { active: true } })
        const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
        mockSupabase.from.mockReturnValue({ select: mockSelect } as any)

        const formData = new FormData()
        formData.append('email', 'test@example.com')
        formData.append('password', 'password')

        await login(formData)

        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password',
        })
        expect(redirect).toHaveBeenCalledWith('/dashboard')
    })

    test('prevents login for deactivated user', async () => {
        // Mock success sign in (initial auth layer passes)
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })
        
        // Mock user found
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
        
        // Mock profile active=false
        const mockSingle = vi.fn().mockResolvedValue({ data: { active: false } })
        const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
        mockSupabase.from.mockReturnValue({ select: mockSelect } as any)

        const formData = new FormData()
        formData.append('email', 'deactivated@example.com')
        formData.append('password', 'password')

        const result = await login(formData)

        // Should sign out immediately
        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
        
        // Should return error
        expect(result).toEqual({ error: "Your account has been deactivated. Please contact an administrator." })
        
        // Should NOT redirect
        expect(redirect).not.toHaveBeenCalled()
    })

    test('returns error on invalid credentials', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })

        const formData = new FormData()
        formData.append('email', 'wrong@example.com')
        formData.append('password', 'wrong')

        const result = await login(formData)

        expect(result).toEqual({ error: 'Invalid login credentials' })
        expect(redirect).not.toHaveBeenCalled()
    })
})
