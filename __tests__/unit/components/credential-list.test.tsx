import { expect, test, describe, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CredentialList } from '@/components/credentials/credential-list'
import * as actions from '@/app/dashboard/actions'
import { toast } from 'sonner'

// Mock Child Components to avoid complex rendering
vi.mock('@/components/credentials/card-credential', () => ({
    CredentialCard: ({ onDelete, credential }: any) => (
        <div data-testid="credential-card">
            {credential.title}
            <button onClick={() => onDelete(credential)}>Delete Me</button>
        </div>
    )
}))

vi.mock('@/components/credentials/form-credential', () => ({
    CredentialForm: () => <div data-testid="credential-form">Form</div>
}))

vi.mock('@/components/credentials/share-dialog', () => ({
    ShareDialog: () => <div data-testid="share-dialog">Share</div>
}))

vi.mock('@/components/credentials/totp-viewer', () => ({
    TotpViewer: () => <div>TOTP</div>
}))

// Mock Server Actions
vi.mock('@/app/dashboard/actions', () => ({
    deleteCredential: vi.fn(),
}))

// Mock Toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

const mockCredentials = [
    { id: '1', title: 'Cred 1', username: 'user1', password: 'pw1', created_by: 'user1' },
    { id: '2', title: 'Cred 2', username: 'user2', password: 'pw2', created_by: 'other' }
]

describe('CredentialList', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('Admin/Editor sees Add Credential button', () => {
        const { rerender } = render(<CredentialList initialCredentials={[]} currentUserRole="Admin" />)
        expect(screen.getByText('Add Credential')).toBeDefined()

        rerender(<CredentialList initialCredentials={[]} currentUserRole="Editor" />)
        expect(screen.getByText('Add Credential')).toBeDefined()
    })

    test('Viewer does NOT see Add Credential button', () => {
        render(<CredentialList initialCredentials={[]} currentUserRole="Viewer" />)
        expect(screen.queryByText('Add Credential')).toBeNull() 
    })

    test('Handles Delete Process', async () => {
         render(<CredentialList initialCredentials={mockCredentials} currentUserRole="Admin" />)
         
         // 1. Click Delete on Card (mocked button)
         const deleteButtons = screen.getAllByText('Delete Me')
         fireEvent.click(deleteButtons[0]) // Delete Cred 1

         // 2. Dialog should open
         expect(screen.getByText(/Are you sure you want to delete/)).toBeDefined()
         expect(screen.getByText(/"Cred 1"/)).toBeDefined()

         // 3. Click Delete in Dialog
         const confirmBtn = screen.getByRole('button', { name: 'Delete' })
         
         // Mock success
         vi.mocked(actions.deleteCredential).mockResolvedValue({ success: true } as any)

         fireEvent.click(confirmBtn)
         
         await waitFor(() => {
             expect(actions.deleteCredential).toHaveBeenCalledWith('1')
             expect(toast.success).toHaveBeenCalledWith('Credential deleted')
         })
    })
})
