import { expect, test, describe, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/ui/sidebar'

// Mock usePathname
vi.mock('next/navigation', () => ({
    usePathname: () => '/dashboard',
}))

// Mock signout action
vi.mock('@/app/auth/actions', () => ({
    signout: vi.fn(),
}))

describe('Sidebar Menu Visibility', () => {
    test('Admin sees all menu items', () => {
        render(<Sidebar userRole="Admin" userName="Admin User" userEmail="admin@test.com" />)
        
        expect(screen.getByText('Dashboard')).toBeDefined()
        expect(screen.getByText('Credentials')).toBeDefined()
        expect(screen.getByText('Shared')).toBeDefined()
        expect(screen.getByText('Settings')).toBeDefined()
        expect(screen.getByText('Help')).toBeDefined()
    })

    test('Editor sees authorized items but not Settings', () => {
        render(<Sidebar userRole="Editor" userName="Editor User" userEmail="editor@test.com" />)

        expect(screen.getByText('Dashboard')).toBeDefined()
        expect(screen.getByText('Credentials')).toBeDefined()
        expect(screen.getByText('Shared')).toBeDefined()
        expect(screen.getByText('Help')).toBeDefined()
        
        // Settings should be hidden
        expect(screen.queryByText('Settings')).toBeNull()
    })

    test('Viewer sees only Dashboard and Help', () => {
        render(<Sidebar userRole="Viewer" userName="Viewer User" userEmail="viewer@test.com" />)

        expect(screen.getByText('Dashboard')).toBeDefined()
        expect(screen.getByText('Help')).toBeDefined()

        // Restricted items should be hidden
        expect(screen.queryByText('Credentials')).toBeNull()
        expect(screen.queryByText('Shared')).toBeNull()
        expect(screen.queryByText('Settings')).toBeNull()
    })

    test('Visualizes user info and logout button', () => {
         render(<Sidebar userRole="Viewer" userName="John Doe" userEmail="john@test.com" />)
         
         expect(screen.getByText('John Doe')).toBeDefined()
         expect(screen.getByText('john@test.com')).toBeDefined()
         // Logout button (icon)
         expect(screen.getByRole('button', { type: 'submit' })).toBeDefined()
    })
})
