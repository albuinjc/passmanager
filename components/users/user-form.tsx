"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { userSchema } from "@/lib/schemas"
import { createUser, updateUser } from "@/app/dashboard/settings/actions"
import { toast } from "sonner"

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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userToEdit?: any | null 
    onSuccess?: () => void
}

export function UserForm({ open, onOpenChange, userToEdit, onSuccess }: UserFormProps) {
    const isEditing = !!userToEdit

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: userToEdit?.name || "",
            email: userToEdit?.email || "",
            password: "", 
            description: userToEdit?.description || "",
            role: userToEdit?.role || "Viewer",
            active: userToEdit?.active ?? true,
        },
    })

    const { reset } = form

    useEffect(() => {
        if (userToEdit) {
            reset({
                name: userToEdit.name || "",
                email: userToEdit.email || "",
                password: "",
                description: userToEdit.description || "",
                role: userToEdit.role || "Viewer",
                active: userToEdit.active ?? true,
            })
        } else {
            reset({
                name: "",
                email: "",
                password: "",
                description: "",
                role: "Viewer",
                active: true,
            })
        }
    }, [userToEdit, reset])

    const onSubmit = async (data: UserFormValues) => {
        try {
            let result
            if (isEditing) {
                
                const updateData = { ...data }
                if (!updateData.password) delete updateData.password

                result = await updateUser(userToEdit.id, updateData)
            } else {
                result = await createUser(data)
            }

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(isEditing ? "User updated" : "User created")
                onOpenChange(false)
                form.reset()
                if (onSuccess) onSuccess()
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update user details and role." : "Create a new user for the platform."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@company.com" {...field} disabled={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{isEditing ? "New Password (Leave blank to keep)" : "Password"}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                            <SelectItem value="Editor">Editor</SelectItem>
                                            <SelectItem value="Viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="User role description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active</FormLabel>
                                        <FormDescription>
                                            Allow this user to sign in.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">{isEditing ? "Save Changes" : "Create User"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
