import { expect, test, describe, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserForm } from '@/components/users/user-form'
import { toast } from 'sonner'
import * as actions from '@/app/dashboard/settings/actions'

// Mock server actions
vi.mock('@/app/dashboard/settings/actions', () => ({
    createUser: vi.fn(),
    updateUser: vi.fn(),
}))

// Mock Toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    }
}))

// Pass ResizeObserver mock if not global
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
global.ResizeObserver = ResizeObserver

describe('UserForm', () => {
    const onOpenChange = vi.fn()
    const onSuccess = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        // Mock scrollIntoView for Radix Select
        window.HTMLElement.prototype.scrollIntoView = vi.fn()
    })

    test('renders create user form correctly', () => {
        render(<UserForm open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />)
        
        expect(screen.getByText('Add User')).toBeDefined()
        expect(screen.getByLabelText('Name')).toBeDefined()
        expect(screen.getByLabelText('Email')).toBeDefined()
        expect(screen.getByLabelText('Password')).toBeDefined()
        expect(screen.getByRole('button', { name: /create user/i })).toBeDefined()
    })

    test('renders edit user form correctly', () => {
        const userToEdit = {
            id: '123',
            name: 'Existing User',
            email: 'existing@test.com',
            role: 'Editor',
            active: true,
            description: 'A test user'
        }
        
        render(<UserForm open={true} onOpenChange={onOpenChange} userToEdit={userToEdit} onSuccess={onSuccess} />)
        
        expect(screen.getByText('Edit User')).toBeDefined()
        expect(screen.getByDisplayValue('Existing User')).toBeDefined()
        expect(screen.getByDisplayValue('existing@test.com')).toBeDefined()
        // Email should be disabled
        expect(screen.getByLabelText('Email').hasAttribute('disabled')).toBe(true)
        // Button text
        expect(screen.getByRole('button', { name: /save changes/i })).toBeDefined()
    })

    test('disables active toggle for self-edit', () => {
        const userToEdit = {
            id: 'current-user-id',
            name: 'Me',
            email: 'me@test.com',
            role: 'Admin',
            active: true
        }
        render(<UserForm open={true} onOpenChange={onOpenChange} userToEdit={userToEdit} currentUserId="current-user-id" />)
        
        // Find switch.
        const switchBtn = screen.getByRole('switch', { name: /active/i })
        expect(switchBtn.hasAttribute('disabled')).toBe(true)
    })

    test('validates form submission', async () => {
         render(<UserForm open={true} onOpenChange={onOpenChange} />)
         
         const submitBtn = screen.getByRole('button', { name: /create user/i })
         fireEvent.click(submitBtn)
         
         // Should show validation errors
         await waitFor(() => {
             // Name is required (min 2 chars)
             expect(screen.getByText('Name must be at least 2 characters')).toBeDefined()
         })
    })

    test('calls createUser on submit', async () => {
        // Mock successful creation
        vi.mocked(actions.createUser).mockResolvedValue({ success: true, user: {} } as any)

        render(<UserForm open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />)

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New User' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@test.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
        // Role defaults to Viewer.
        
        const submitBtn = screen.getByRole('button', { name: /create user/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(actions.createUser).toHaveBeenCalled() 
            expect(onSuccess).toHaveBeenCalled()
            expect(toast.success).toHaveBeenCalledWith('User created')
        })
    })

    test('creates an Admin user', async () => {
        vi.mocked(actions.createUser).mockResolvedValue({ success: true } as any)
        render(<UserForm open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />)

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Admin User' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@test.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin123' } })

        const roleTrigger = screen.getByRole('combobox')
        fireEvent.click(roleTrigger)
        
        const adminOption = screen.getByRole('option', { name: 'Admin' })
        fireEvent.click(adminOption)

        const submitBtn = screen.getByRole('button', { name: /create user/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(actions.createUser).toHaveBeenCalledWith(expect.objectContaining({
                role: 'Admin'
            }))
        })
    })

    test('creates an Editor user', async () => {
        vi.mocked(actions.createUser).mockResolvedValue({ success: true } as any)
        render(<UserForm open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />)

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Editor User' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'editor@test.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'editor123' } })

        const roleTrigger = screen.getByRole('combobox')
        fireEvent.click(roleTrigger)
        
        const editorOption = screen.getByRole('option', { name: 'Editor' })
        fireEvent.click(editorOption)

        const submitBtn = screen.getByRole('button', { name: /create user/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(actions.createUser).toHaveBeenCalledWith(expect.objectContaining({
                role: 'Editor'
            }))
        })
    })

    test('edits an existing user', async () => {
        const userToEdit = {
            id: 'u1',
            name: 'Old Name',
            email: 'old@test.com',
            role: 'Viewer',
            active: true
        }
        vi.mocked(actions.updateUser).mockResolvedValue({ success: true } as any)

        render(<UserForm open={true} onOpenChange={onOpenChange} userToEdit={userToEdit} onSuccess={onSuccess} />)

        // Change Name
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Name' } })
        
        const submitBtn = screen.getByRole('button', { name: /save changes/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(actions.updateUser).toHaveBeenCalledWith('u1', expect.objectContaining({
                name: 'New Name'
            }))
            expect(toast.success).toHaveBeenCalledWith('User updated')
        })
    })

    test('deactivates a user', async () => {
         const userToEdit = {
             id: 'u2',
             name: 'User To Deactivate',
             email: 'u2@test.com',
             role: 'Viewer',
             active: true
         }
         vi.mocked(actions.updateUser).mockResolvedValue({ success: true } as any)
 
         render(<UserForm open={true} onOpenChange={onOpenChange} userToEdit={userToEdit} onSuccess={onSuccess} />)
 
         // Find Switch and toggle
         const switchBtn = screen.getByRole('switch', { name: /active/i })
         fireEvent.click(switchBtn)
 
         const submitBtn = screen.getByRole('button', { name: /save changes/i })
         fireEvent.click(submitBtn)
 
         await waitFor(() => {
             expect(actions.updateUser).toHaveBeenCalledWith('u2', expect.objectContaining({
                 active: false
             }))
             expect(toast.success).toHaveBeenCalledWith('User updated')
         })
    })
})
