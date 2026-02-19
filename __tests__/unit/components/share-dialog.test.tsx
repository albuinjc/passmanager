import { expect, test, describe, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareDialog } from '@/components/credentials/share-dialog'
import * as actions from '@/app/dashboard/actions'
import { toast } from 'sonner'

// Mock Server Actions
vi.mock('@/app/dashboard/actions', () => ({
    searchUsers: vi.fn(),
    shareCredential: vi.fn(),
    getCredentialShares: vi.fn(),
    removeCredentialShare: vi.fn(),
}))

// Mock Toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

// Mock Radix UI parts if needed or rely on JSDOM
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.ResizeObserver = ResizeObserver

describe('ShareDialog', () => {
    const credentialId = 'cred-1'
    const credentialTitle = 'My Secret'

    beforeEach(() => {
        vi.clearAllMocks()
        // Default mocks
        vi.mocked(actions.getCredentialShares).mockResolvedValue([])
    })

    test('Loads existing shares on open', async () => {
        const shares = [{ id: 's1', userId: 'u1', name: 'User One', email: 'u1@test.com' }]
        vi.mocked(actions.getCredentialShares).mockResolvedValue(shares)

        render(<ShareDialog credentialId={credentialId} credentialTitle={credentialTitle} open={true} />)

        await waitFor(() => {
            expect(actions.getCredentialShares).toHaveBeenCalledWith(credentialId)
            expect(screen.getByText('User One')).toBeDefined()
            expect(screen.getByText('u1@test.com')).toBeDefined()
        })
    })

    test('Removes existing share', async () => {
         const shares = [{ id: 's1', userId: 'u1', name: 'User One', email: 'u1@test.com' }]
         vi.mocked(actions.getCredentialShares).mockResolvedValue(shares)
         vi.mocked(actions.removeCredentialShare).mockResolvedValue({ success: true } as any)

         render(<ShareDialog credentialId={credentialId} credentialTitle={credentialTitle} open={true} />)

         // Wait for load
         await waitFor(() => screen.getByText('User One'))

         // Find remove button (trash icon)
         const removeBtn = screen.getByTitle('Remove access')
         fireEvent.click(removeBtn)

         await waitFor(() => {
             expect(actions.removeCredentialShare).toHaveBeenCalledWith(credentialId, 'u1')
             expect(toast.success).toHaveBeenCalledWith('User access revoked')
             // Should disappear
             expect(screen.queryByText('User One')).toBeNull()
         })
    })

    test('Search and Add User', async () => {
        // Setup Search Mock
        const searchResult = [{ id: 'u2', name: 'User Two', email: 'u2@test.com' }]
        vi.mocked(actions.searchUsers).mockResolvedValue(searchResult)
        
        // Setup Share Mock
        vi.mocked(actions.shareCredential).mockResolvedValue({ success: true } as any)

        render(<ShareDialog credentialId={credentialId} credentialTitle={credentialTitle} open={true} />)

        // 1. Open Combobox
        const trigger = screen.getByRole('combobox') // The button trigger
        fireEvent.click(trigger)

        // 2. Type in input
        const input = screen.getByPlaceholderText('Type email to search...')
        fireEvent.change(input, { target: { value: 'u2' } })

        // 3. Expect Search
        await waitFor(() => {
            expect(actions.searchUsers).toHaveBeenCalledWith('u2')
            expect(screen.getByText('User Two')).toBeDefined()
        })

        // 4. Select User
        fireEvent.click(screen.getByText('User Two'))

        // 5. Verify Badge appears
        expect(screen.getByText('u2@test.com')).toBeDefined() // Badge content

        // 6. Click Share
        const shareBtn = screen.getByRole('button', { name: 'Share Credential' })
        fireEvent.click(shareBtn)

        await waitFor(() => {
            expect(actions.shareCredential).toHaveBeenCalledWith(credentialId, ['u2@test.com'])
            expect(toast.success).toHaveBeenCalledWith('Shared with 1 user(s)')
        })
    })
})
