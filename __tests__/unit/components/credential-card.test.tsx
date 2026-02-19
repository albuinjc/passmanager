import { expect, test, describe, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CredentialCard } from '@/components/credentials/card-credential'
import { toast } from 'sonner'

// Mock Child Components
vi.mock('@/components/credentials/totp-viewer', () => ({
    TotpViewer: () => <div data-testid="totp-viewer">TOTP Viewer</div>
}))

vi.mock('@/components/credentials/share-dialog', () => ({
    ShareDialog: () => <div data-testid="share-dialog">Share Dialog</div>
}))

// Mock Dropdown Menu to be flat for testing
vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <>{children}</>, // Just render children (Limit: asChild not handled manually, but if children is Button, it works)
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}))

// Mock Clipboard
const writeTextMock = vi.fn()
Object.assign(navigator, {
    clipboard: {
        writeText: writeTextMock,
    },
});


// Mock Toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

const mockCredential = {
    id: '1',
    title: 'Test Credential',
    username: 'user@test.com',
    password: 'securePassword',
    url: 'https://test.com',
    description: 'Test Description',
    two_fa_seed: 'SEED123',
    created_by: 'owner-id'
}

describe('CredentialCard', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('calls onDelete when delete action is clicked', () => {
        render(<CredentialCard credential={mockCredential} currentUserRole="Admin" currentUserId="admin-id" onEdit={onEdit} onDelete={onDelete} />)
        
        // Open menu
        const menuBtn = screen.getByRole('button', { name: /open menu/i })
        fireEvent.click(menuBtn)

        // Click delete
        const deleteItem = screen.getByText('Delete')
        fireEvent.click(deleteItem)

        expect(onDelete).toHaveBeenCalledWith(mockCredential)
    })

    test('renders basics correctly', () => {
        render(<CredentialCard credential={mockCredential} onEdit={onEdit} onDelete={onDelete} />)
        expect(screen.getByText('Test Credential')).toBeDefined()
        expect(screen.getByText('user@test.com')).toBeDefined()
        const passwordInput = screen.getByDisplayValue('securePassword')
        expect(passwordInput).toBeDefined()
        expect(passwordInput.getAttribute('type')).toBe('password') 
    })

    test('toggles password visibility', () => {
        render(<CredentialCard credential={mockCredential} onEdit={onEdit} onDelete={onDelete} />)
        const passwordInput = screen.getByDisplayValue(mockCredential.password)
        expect(passwordInput.getAttribute('type')).toBe('password')

        const toggleButton = screen.getByTestId('toggle-password')
        fireEvent.click(toggleButton)
        
        // After click, type should be text
        expect(screen.getByDisplayValue(mockCredential.password).getAttribute('type')).toBe('text')
    })

    test('copies username to clipboard', () => {
         render(<CredentialCard credential={mockCredential} onEdit={onEdit} onDelete={onDelete} />)
         const usernameEl = screen.getByText('user@test.com')
         fireEvent.click(usernameEl) // The div wrapper has onClick
         expect(writeTextMock).toHaveBeenCalledWith('user@test.com')
         expect(toast.success).toHaveBeenCalled()
    })

    test('shows actions for owner/admin', () => {
        render(<CredentialCard credential={mockCredential} currentUserRole="Admin" currentUserId="admin-id" onEdit={onEdit} onDelete={onDelete} />)
        // Check for Share button
        expect(screen.getByTestId('share-dialog')).toBeDefined()
        // Check for Menu (MoreHorizontal)
        expect(screen.getByRole('button', { name: /open menu/i })).toBeDefined()
    })

    test('hides delete for Viewer', () => {
         render(<CredentialCard credential={mockCredential} currentUserRole="Viewer" currentUserId="viewer-id" onEdit={onEdit} onDelete={onDelete} />)
         // Viewer has no Share Dialog
         expect(screen.queryByTestId('share-dialog')).toBeNull()
    })
})
