"use client"

import * as React from "react"
import { useState } from "react"
import { shareCredential, searchUsers, getCredentialShares, removeCredentialShare } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Share2, Check, X, ChevronsUpDown, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShareDialogProps {
    credentialId: string
    credentialTitle: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
}

interface UserResult {
    id: string
    email: string
    name?: string
}

export function ShareDialog({ credentialId, credentialTitle, open: controlledOpen, onOpenChange: setControlledOpen, trigger }: ShareDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined

    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? setControlledOpen! : setInternalOpen
    const [loading, setLoading] = useState(false)
    const [openCombobox, setOpenCombobox] = useState(false)
    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState<UserResult[]>([])
    const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([])

    const [existingShares, setExistingShares] = useState<any[]>([])

    React.useEffect(() => {
        if (open) {
            getCredentialShares(credentialId).then(setExistingShares)
        } else {
            setExistingShares([])
            setSearchResults([])
            setSelectedUsers([])
            setQuery("")
        }
    }, [open, credentialId])

    const handleSearch = async (value: string) => {
        setQuery(value)
        if (value.length < 2) {
            setSearchResults([])
            return
        }
        const users = await searchUsers(value)

        const filteredUsers = users.filter(user =>
            !existingShares.some(share => share.userId === user.id)
        )
        setSearchResults(filteredUsers)
    }

    const handleSelect = (user: UserResult) => {
        if (!selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers([...selectedUsers, user])
        }
        setOpenCombobox(false)
        setQuery("")
    }

    const handleRemove = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== userId))
    }

    const handleRemoveExistingShare = async (userId: string) => {
        try {
            const result = await removeCredentialShare(credentialId, userId)
            if (result && 'error' in result) {
                toast.error("Failed to remove user")
            } else {
                toast.success("User access revoked")
                setExistingShares(prev => prev.filter(s => s.userId !== userId))
            }
        } catch (error) {
            toast.error("Error removing user")
        }
    }

    const onSubmit = async () => {
        if (selectedUsers.length === 0) {
            toast.error("Please select at least one user")
            return
        }

        setLoading(true)
        try {
            const emails = selectedUsers.map(u => u.email)
            const result = await shareCredential(credentialId, emails)

            if (result && 'error' in result) {
                toast.error(String(result.error))
            } else {
                toast.success(`Shared with ${emails.length} user(s)`)
                setOpen(false)
                setSelectedUsers([])
            }
        } catch (error) {
            toast.error("Failed to share credential")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="h-8">
                        <Share2 className="mr-2 h-3.5 w-3.5" />
                        Share
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share Credential</DialogTitle>
                    <DialogDescription>
                        Share <span className="font-semibold">{credentialTitle}</span> with others.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Add Users</label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                >
                                    {query || "Search users via email..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[460px] p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Type email to search..."
                                        value={query}
                                        onValueChange={handleSearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>{query.length < 2 ? "Type at least 2 characters..." : "No users found."}</CommandEmpty>
                                        <CommandGroup heading="Results">
                                            {searchResults.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={user.email}
                                                    onSelect={() => handleSelect(user)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedUsers.find(u => u.id === user.id) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/20">
                        {selectedUsers.length === 0 && (
                            <span className="text-sm text-muted-foreground self-center">No users selected.</span>
                        )}
                        {selectedUsers.map((user) => (
                            <Badge key={user.id} variant="secondary" className="pl-2 pr-1 h-7">
                                {user.email}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 ml-1 hover:bg-destructive/20 rounded-full"
                                    onClick={() => handleRemove(user.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>

                    {existingShares.length > 0 && (
                        <div className="space-y-2 border-t pt-4">
                            <h4 className="text-sm font-medium">Shared with:</h4>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                {existingShares.map(share => (
                                    <div key={share.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{share.name || "Unknown"}</span>
                                            <span className="text-xs text-muted-foreground">{share.email}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveExistingShare(share.userId)}
                                            title="Remove access"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onSubmit} disabled={loading || selectedUsers.length === 0}>
                        {loading ? "Sharing..." : "Share Credential"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
