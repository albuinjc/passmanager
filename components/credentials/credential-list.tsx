"use client"

import { useState } from "react"
import { CredentialCard } from "./card-credential"
import { CredentialForm } from "./form-credential"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface CredentialListProps {
    initialCredentials: any[]
    currentUserRole?: string
    currentUserId?: string
}

export function CredentialList({ initialCredentials, currentUserRole, currentUserId }: CredentialListProps) {
    const [credentials, setCredentials] = useState(initialCredentials)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCredential, setEditingCredential] = useState<any | null>(null)
    const [searchQuery, setSearchQuery] = useState("")








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
                {currentUserRole !== 'Viewer' && (
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Credential
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCredentials.map((credential) => (
                    <div key={credential.id} className="relative h-full">
                        {/* We need to pass onEdit to CredentialCard if we want to trigger edit from card */}
                        {/* Currently CredentialCard has dropdown menu for edit. We need to pass a handler. */}
                        <CredentialCard
                            credential={credential}
                            currentUserRole={currentUserRole}
                            currentUserId={currentUserId}
                            onEdit={handleEdit}
                        />
                    </div>
                ))}
            </div>

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
        </div>
    )
}
