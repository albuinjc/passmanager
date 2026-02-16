"use client"

import { useState } from "react"
import { CredentialCard } from "./card-credential"
import { CredentialForm } from "./form-credential"
import { Button } from "@/components/ui/button"
import { Plus, Search, LayoutGrid, List, Copy, Eye, EyeOff, MoreHorizontal, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { deleteCredential } from "@/app/dashboard/actions"
import { TotpViewer } from "./totp-viewer"
import { ShareDialog } from "./share-dialog"

interface CredentialListProps {
    initialCredentials: any[]
    currentUserRole?: string
    currentUserId?: string
}

export function CredentialList({ initialCredentials, currentUserRole, currentUserId }: CredentialListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCredential, setEditingCredential] = useState<any | null>(null)
    const [sharingCredential, setSharingCredential] = useState<any | null>(null)
    const [credentialToDelete, setCredentialToDelete] = useState<any | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({})

    const filteredCredentials = initialCredentials.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleEdit = (credential: any) => {
        setEditingCredential(credential)
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setEditingCredential(null)
        setIsModalOpen(true)
    }

    const initiateDelete = (credential: any) => {
        setCredentialToDelete(credential)
    }

    const confirmDelete = async () => {
        if (!credentialToDelete) return

        const res = await deleteCredential(credentialToDelete.id)
        if (res && 'error' in res) {
            toast.error(String(res.error))
        } else {
            toast.success("Credential deleted")
        }
        setCredentialToDelete(null)
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard`)
    }

    const togglePassword = (id: string) => {
        setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search credentials..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md p-1 bg-muted/50">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode("grid")}
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode("list")}
                            title="List View"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    {currentUserRole !== 'Viewer' && (
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Add Credential
                        </Button>
                    )}
                </div>
            </div>

            {viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCredentials.map((credential) => (
                        <div key={credential.id} className="relative h-full">
                            <CredentialCard
                                credential={credential}
                                currentUserRole={currentUserRole}
                                currentUserId={currentUserId}
                                onEdit={handleEdit}
                                onDelete={initiateDelete}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead>TOTP</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCredentials.map((credential) => {
                                const isOwner = credential.created_by === currentUserId
                                const isAdmin = currentUserRole === 'Admin'
                                const isEditor = currentUserRole === 'Editor'
                                const canEdit = isAdmin || isOwner || isEditor
                                const canDelete = isAdmin || isOwner

                                return (
                                    <TableRow key={credential.id}>
                                        <TableCell className="font-medium">{credential.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard(credential.username, "Username")}>
                                                <span className="truncate max-w-[200px]">{credential.username}</span>
                                                <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-sm">
                                                    {showPasswordMap[credential.id] ? credential.password : "••••••••"}
                                                </span>
                                                <div className="flex items-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => togglePassword(credential.id)}
                                                    >
                                                        {showPasswordMap[credential.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => copyToClipboard(credential.password, "Password")}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {credential.two_fa_seed && (
                                                <div className="scale-75 origin-left w-[240px]">
                                                    <TotpViewer seed={credential.two_fa_seed} />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => copyToClipboard(credential.username, "Username")}>
                                                        Copy Username
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => copyToClipboard(credential.password, "Password")}>
                                                        Copy Password
                                                    </DropdownMenuItem>
                                                    {credential.url && (
                                                        <DropdownMenuItem asChild>
                                                            <a href={credential.url} target="_blank" rel="noopener noreferrer">Launch URL</a>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {canEdit && ( // Reusing logic roughly for share, as Card uses same logic
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => setSharingCredential(credential)}>Share</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEdit(credential)}>Edit</DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {canDelete && (
                                                        <DropdownMenuItem className="text-red-600" onClick={() => initiateDelete(credential)}>Delete</DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {filteredCredentials.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    No credentials found.
                </div>
            )}

            <CredentialForm
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                credentialToEdit={editingCredential}
            />

            {sharingCredential && (
                <ShareDialog
                    credentialId={sharingCredential.id}
                    credentialTitle={sharingCredential.title}
                    open={!!sharingCredential}
                    onOpenChange={(open) => !open && setSharingCredential(null)}
                    trigger={<span className="hidden"></span>} // Hidden trigger
                />
            )}

            <Dialog open={!!credentialToDelete} onOpenChange={(open) => !open && setCredentialToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Credential</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{credentialToDelete?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCredentialToDelete(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
