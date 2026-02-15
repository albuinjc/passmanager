"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Edit, Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { UserForm } from "./user-form"
import { updateUser } from "@/app/dashboard/settings/actions"
import { toast } from "sonner"

interface User {
    id: string
    name?: string
    email: string
    role: string
    description?: string
    active: boolean
    created_at: string
}

interface UserTableProps {
    initialUsers: User[]
    currentUserId?: string
}

import { useRouter } from "next/navigation"

export function UserTable({ initialUsers, currentUserId }: UserTableProps) {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [search, setSearch] = useState("")
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    useEffect(() => {
        setUsers(initialUsers)
    }, [initialUsers])

    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    )

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setIsFormOpen(true)
    }

    const handleAdd = () => {
        setEditingUser(null)
        setIsFormOpen(true)
    }

    const handleFormSuccess = () => {
        setIsFormOpen(false)
        router.refresh()
    }

    const handleActiveToggle = async (user: User, check: boolean) => {
        if (user.id === currentUserId && !check) {
            toast.error("You cannot deactivate your own account")
            return
        }

        const updatedUsers = users.map(u => u.id === user.id ? { ...u, active: check } : u)
        setUsers(updatedUsers)

        try {
            const result = await updateUser(user.id, { active: check, role: user.role as any })
            if (result.error) {
                toast.error(result.error)

                setUsers(users)
            } else {
                toast.success(`User ${check ? 'activated' : 'deactivated'}`)
            }
        } catch (error) {
            toast.error("Failed to update status")
            setUsers(users)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button onClick={handleAdd}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={user.active}
                                            onCheckedChange={(checked) => handleActiveToggle(user, checked)}
                                            disabled={user.id === currentUserId}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {user.created_at ? format(new Date(user.created_at), "PPP") : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {isFormOpen && (
                <UserForm
                    open={isFormOpen}
                    onOpenChange={setIsFormOpen}
                    userToEdit={editingUser}
                    onSuccess={handleFormSuccess}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    )
}
