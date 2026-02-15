"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { credentialSchema, type CredentialFormValues } from "@/lib/schemas"
import { createCredential, updateCredential } from "@/app/dashboard/actions"
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
import { Plus } from "lucide-react"











interface CredentialFormProps {
    credentialToEdit?: any
    open: boolean
    onOpenChange: (open: boolean) => void
}



export function CredentialForm({ credentialToEdit, open, onOpenChange }: CredentialFormProps) {
    const [loading, setLoading] = useState(false)
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
        } else {
            reset({
                title: "",
                username: "",
                password: "",
                url: "",
                description: "",
                two_fa_seed: "",
            })
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
                        <label htmlFor="url" className="text-sm font-medium">URL <span className="text-red-500">*</span></label>
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
