"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Copy, Trash2, Edit, Share2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TotpViewer } from "./totp-viewer"
import { ShareDialog } from "./share-dialog"

interface CredentialCardProps {
    credential: any
    currentUserRole?: string
    currentUserId?: string
    onEdit: (credential: any) => void
    onDelete: (credential: any) => void
}

export function CredentialCard({ credential, currentUserRole, currentUserId, onEdit, onDelete }: CredentialCardProps) {
    const [showPassword, setShowPassword] = useState(false)

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard`)
    }

    const isOwner = credential.created_by === currentUserId
    const isAdmin = currentUserRole === 'Admin'
    const isEditor = currentUserRole === 'Editor'

    const canEdit = isAdmin || isOwner || isEditor
    const canDelete = isAdmin || isOwner
    const canShare = isAdmin || isOwner || isEditor

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold truncate">{credential.title}</CardTitle>
                    <div className="flex items-center gap-1 group cursor-pointer" onClick={() => copyToClipboard(credential.username, "Username")}>
                        <CardDescription className="truncate text-xs group-hover:text-foreground transition-colors">
                            {credential.username}
                        </CardDescription>
                        <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
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
                        {canEdit && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onEdit(credential)}>Edit</DropdownMenuItem>
                            </>
                        )}
                        {canDelete && (
                            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(credential)}>Delete</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="grid gap-4 flex-1">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={credential.password}
                            readOnly
                            className="pr-20 font-mono text-sm"
                        />
                        <div className="absolute right-0 top-0 h-full flex items-center pr-1 gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => copyToClipboard(credential.password, "Password")}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {credential.two_fa_seed && (
                    <TotpViewer seed={credential.two_fa_seed} />
                )}
            </CardContent>
            <CardFooter className="justify-between">
                {credential.url && (
                    <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground" asChild>
                        <a href={credential.url} target="_blank" rel="noopener noreferrer">Launch URL</a>
                    </Button>
                )}
                <div className="flex gap-2">
                    {canShare && (
                        <ShareDialog credentialId={credential.id} credentialTitle={credential.title} />
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
