"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { credentialSchema, type CredentialFormValues } from "@/lib/schemas"
import { createCredential, updateCredential, getCredentialShares, removeCredentialShare } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { Plus, Trash2, UserMinus } from "lucide-react"











interface CredentialFormProps {
    credentialToEdit?: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface SharedUser {
    id: string
    userId: string
    email: string
    name: string
}

export function CredentialForm({ credentialToEdit, open, onOpenChange }: CredentialFormProps) {
    const [loading, setLoading] = useState(false)
    const [shares, setShares] = useState<SharedUser[]>([])
    const isEditing = !!credentialToEdit

    const form = useForm<CredentialFormValues>({
        resolver: zodResolver(credentialSchema),
        defaultValues: credentialToEdit || {
            title: "",
            username: "",
            password: "",
            url: "",
            description: "",
            two_fa_seed: "",
        },
    })

    const { register, handleSubmit, formState: { errors }, reset } = form


    useEffect(() => {
        if (credentialToEdit) {
            reset(credentialToEdit)
            // Fetch shares
            getCredentialShares(credentialToEdit.id).then(setShares)
        } else {
            reset({
                title: "",
                username: "",
                password: "",
                url: "",
                description: "",
                two_fa_seed: "",
            })
            setShares([])
        }
    }, [credentialToEdit, reset, open]) // Added open to refresh when reopening



    const onSubmit = async (data: CredentialFormValues) => {
        setLoading(true)
        try {
            const formData = new FormData()
            Object.entries(data).forEach(([key, value]) => {
                if (value) formData.append(key, value)
            })

            let result
            if (isEditing) {
                result = await updateCredential(credentialToEdit.id, formData)
            } else {
                result = await createCredential(formData)
            }

            if (result && 'error' in result) {

                toast.error("Error saving credential")
                console.error(result.error)
            } else {
                toast.success(`Credential ${isEditing ? "updated" : "created"}`)
                onOpenChange(false)
                reset()
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveShare = async (userId: string) => {
        if (!credentialToEdit) return

        try {
            const result = await removeCredentialShare(credentialToEdit.id, userId)
            if (result && 'error' in result) {
                toast.error("Failed to remove user")
            } else {
                toast.success("User removed from credential")
                setShares(prev => prev.filter(s => s.userId !== userId))
            }
        } catch (error) {
            toast.error("Error removing user")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Credential" : "Add Credential"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update the details of your credential." : "Add a new credential to your vault."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                        <Input id="title" {...register("title")} placeholder="e.g. Google Work" />
                        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="username" className="text-sm font-medium">Username/Email <span className="text-red-500">*</span></label>
                        <Input id="username" {...register("username")} placeholder="user@company.com" />
                        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="password" className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Input id="password" type="password" {...register("password")} placeholder="********" />
                        </div>
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="url" className="text-sm font-medium">URL</label>
                        <Input id="url" {...register("url")} placeholder="https://..." />
                        {errors.url && <p className="text-sm text-red-500">{errors.url.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="two_fa_seed" className="text-sm font-medium">TOTP Seed (Optional)</label>
                        <Input id="two_fa_seed" {...register("two_fa_seed")} placeholder="JBSWY3DPEHPK3PXP" />
                        {errors.two_fa_seed && <p className="text-sm text-red-500">{errors.two_fa_seed.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                        <Input id="description" {...register("description")} placeholder="Notes..." />
                        {/* Using Input instead of Textarea since I don't have Textarea component yet */}
                    </div>

                    {isEditing && shares.length > 0 && (
                        <div className="space-y-2 border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium">Shared with:</h4>
                            <div className="space-y-2">
                                {shares.map(share => (
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
                                            onClick={() => handleRemoveShare(share.userId)}
                                            title="Remove access"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Credential"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
