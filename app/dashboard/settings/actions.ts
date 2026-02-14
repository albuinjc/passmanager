"use server"

import { createClient } from "@/lib/supabase-server"
import { createServiceClient } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { userSchema } from "@/lib/schemas"

import { MOCK_PROFILE } from "@/lib/mock-data"

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'


async function getUserRole(supabase: any, userId: string) {
    if (isDemo) return MOCK_PROFILE.role || "Viewer"
    const { data } = await supabase.from("profiles").select("role").eq("id", userId).single()
    return data?.role || "Viewer"
}

export async function createUser(data: z.infer<typeof userSchema>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()


    const requestorId = user?.id || MOCK_PROFILE.id
    const role = await getUserRole(supabase, requestorId)

    if (role !== "Admin") {
        return { error: "Only Admins can create users" }
    }

    const result = userSchema.safeParse(data)

    if (!result.success) {
        return { error: "Validation failed" }
    }

    if (isDemo) {
        console.log("Mock Create User:", data)
        revalidatePath("/dashboard/settings")
        return { success: true, message: "User created (Demo Mode)" }
    }

    try {
        const serviceClient = createServiceClient()

        const { data: userData, error: createError } = await serviceClient.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
                full_name: data.name
            }
        })

        if (createError) {
            console.error("Error creating user:", createError)
            return { error: createError.message }
        }

        if (!userData.user) {
            return { error: "Failed to create user" }
        }

        const { error: updateError } = await serviceClient
            .from("profiles")
            .update({
                role: data.role,
                active: data.active,
                name: data.name,
                description: data.description
            })
            .eq("id", userData.user.id)

        if (updateError) {
            console.error("Error updating profile:", updateError)
            return { error: "User created but profile update failed: " + updateError.message }
        }

        revalidatePath("/dashboard/settings")
        return { success: true, message: "User created successfully" }
    } catch (error: any) {
        console.error("Unexpected error in createUser:", error)
        return { error: error.message || "An unexpected error occurred" }
    }
}

export async function updateUser(id: string, data: Partial<z.infer<typeof userSchema>>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const requestorId = user?.id || MOCK_PROFILE.id
    const role = await getUserRole(supabase, requestorId)

    if (role !== "Admin") {
        return { error: "Only Admins can update users" }
    }

    if (isDemo) {
        console.log("Mock Update User:", id, data)
        revalidatePath("/dashboard/settings")
        return { success: true, message: "User updated (Demo Mode)" }
    }

    try {
        const serviceClient = createServiceClient()

        const updates: any = {}
        if (data.role) updates.role = data.role
        if (data.active !== undefined) updates.active = data.active
        if (data.name !== undefined) updates.name = data.name
        if (data.description !== undefined) updates.description = data.description

        if (Object.keys(updates).length === 0) return { success: true }

        const { error } = await serviceClient
            .from("profiles")
            .update(updates)
            .eq("id", id)

        if (error) {
            console.error("Error updating user:", error)
            return { error: error.message }
        }

        revalidatePath("/dashboard/settings")
        return { success: true, message: "User updated successfully" }
    } catch (error: any) {
        console.error("Unexpected error in updateUser:", error)
        return { error: error.message || "An unexpected error occurred" }
    }
}

export async function deleteUser(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const requestorId = user?.id || MOCK_PROFILE.id
    const role = await getUserRole(supabase, requestorId)

    if (role !== "Admin") {
        return { error: "Only Admins can delete users" }
    }

    if (isDemo) {
        console.log("Mock Delete User:", id)
        revalidatePath("/dashboard/settings")
        return { success: true, message: "User deleted (Demo Mode)" }
    }

    try {
        const serviceClient = createServiceClient()

        const { error: deleteError } = await serviceClient.auth.admin.deleteUser(id)

        if (deleteError) {
            console.error("Error deleting user:", deleteError)
            return { error: deleteError.message }
        }

        revalidatePath("/dashboard/settings")
        return { success: true, message: "User deleted successfully" }
    } catch (error: any) {
        console.error("Unexpected error in deleteUser:", error)
        return { error: error.message || "An unexpected error occurred" }
    }
}
