"use server"

import { createClient } from "@/lib/supabase-server"
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

    
    
    return { error: "User creation not fully implemented in Real Mode (requires Service Role)" }
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

    const updates: any = {}
    if (data.role) updates.role = data.role
    if (data.active !== undefined) updates.active = data.active

    if (Object.keys(updates).length === 0) return { success: true }

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/dashboard/settings")
    return { success: true }
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

    return { error: "Delete not implemented (requires Service Role)" }
}
