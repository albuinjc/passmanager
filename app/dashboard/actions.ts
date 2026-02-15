"use server"

import { createClient } from "@/lib/supabase-server"
import { credentialSchema, shareSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { MOCK_PROFILE, MOCK_USERS, MOCK_SHARED_CREDENTIALS, MOCK_CREDENTIALS } from "@/lib/mock-data"

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'


async function getUserRole(supabase: any, userId: string) {
    if (isDemo) return MOCK_PROFILE.role || "Viewer"
    const { data } = await supabase.from("profiles").select("role").eq("id", userId).single()
    return data?.role || "Viewer"
}

export async function createCredential(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isDemo) {
        throw new Error("Unauthorized")
    }

    const userId = user?.id || MOCK_PROFILE.id
    const role = await getUserRole(supabase, userId)

    if (role === "Viewer") {
        return { error: "Viewers cannot create credentials" }
    }

    const rawData = {
        title: formData.get("title") as string,
        username: formData.get("username") as string,
        password: formData.get("password") as string,
        url: (formData.get("url") as string) || undefined,
        description: (formData.get("description") as string) || undefined,
        two_fa_seed: (formData.get("two_fa_seed") as string) || "",
    }

    const validatedFields = credentialSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors }
    }

    if (isDemo) {
        console.log("Mock Create Credential:", rawData)
        revalidatePath("/dashboard")
        return { success: true }
    }

    const { error } = await supabase
        .from("credentials")
        .insert({
            ...validatedFields.data,
            created_by: user!.id,
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
}

export async function updateCredential(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isDemo) throw new Error("Unauthorized")

    const userId = user?.id || MOCK_PROFILE.id
    const role = await getUserRole(supabase, userId)


    if (role === "Viewer") {
        return { error: "Viewers cannot edit credentials" }
    }


    if (role === "Editor") {

        let isOwner = false
        let isShared = false

        if (isDemo) {
            isOwner = MOCK_CREDENTIALS.some(c => c.id === id)
            isShared = MOCK_SHARED_CREDENTIALS.some(c => c.id === id)
        } else {
            const { data: cred } = await supabase.from("credentials").select("created_by").eq("id", id).single()
            if (cred?.created_by === userId) isOwner = true

            if (!isOwner) {
                const { data: share } = await supabase.from("credential_shares").select("id").eq("credential_id", id).eq("shared_with", userId).single()
                if (share) isShared = true
            }
        }

        if (!isOwner && !isShared) {
            return { error: "You do not have permission to edit this credential" }
        }
    }

    const rawData = {
        title: formData.get("title") as string,
        username: formData.get("username") as string,
        password: formData.get("password") as string,
        url: (formData.get("url") as string) || undefined,
        description: (formData.get("description") as string) || undefined,
        two_fa_seed: (formData.get("two_fa_seed") as string) || "",
    }

    const validatedFields = credentialSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors }
    }

    if (isDemo) {
        console.log("Mock Update Credential:", id, rawData)
        revalidatePath("/dashboard")
        return { success: true }
    }

    const adminSupabase = createServiceClient()

    const { error } = await adminSupabase
        .from("credentials")
        .update(validatedFields.data)
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
}

export async function deleteCredential(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isDemo) throw new Error("Unauthorized")

    const userId = user?.id || MOCK_PROFILE.id
    const role = await getUserRole(supabase, userId)

    if (role === "Viewer") {
        return { error: "Viewers cannot delete credentials" }
    }

    if (role === "Editor") {

        let isOwner = false
        if (isDemo) {
            isOwner = MOCK_CREDENTIALS.some(c => c.id === id)
        } else {
            const { data: cred } = await supabase.from("credentials").select("created_by").eq("id", id).single()
            if (cred?.created_by === userId) isOwner = true
        }

        if (!isOwner) {
            return { error: "You can only delete your own credentials" }
        }
    }

    if (isDemo) {
        console.log("Mock Delete Credential:", id)
        revalidatePath("/dashboard")
        return { success: true }
    }

    const { error } = await supabase
        .from("credentials")
        .delete()
        .eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
}

export async function searchUsers(query: string) {
    if (isDemo) {
        if (!query || query.length < 2) return []
        return MOCK_USERS.filter(u =>
            u.email.toLowerCase().includes(query.toLowerCase()) ||
            u.name.toLowerCase().includes(query.toLowerCase())
        ).map(u => ({ id: u.id, email: u.email, name: u.name }))
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const adminSupabase = createServiceClient()

    const { data, error } = await adminSupabase
        .from("profiles")
        .select("id, email, name")
        .ilike("email", `%${query}%`)
        .neq("id", user.id)
        .limit(5)

    if (error) {
        console.error("Search users error:", error)
        return []
    }

    return data || []
}

export async function shareCredential(credentialId: string, emails: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isDemo) throw new Error("Unauthorized")

    const userId = user?.id || MOCK_PROFILE.id
    const role = await getUserRole(supabase, userId)

    if (role === "Viewer") {
        return { error: "Viewers cannot share credentials" }
    }

    if (isDemo) {
        console.log(`Mock Share Credential ${credentialId} with:`, emails)
        revalidatePath("/dashboard")
        return { success: true }
    }

    if (!emails || emails.length === 0) return { error: "No users selected" }

    const adminSupabase = createServiceClient()
    const { data: profiles, error: profileError } = await adminSupabase
        .from("profiles")
        .select("id, email")
        .in("email", emails)

    if (profileError || !profiles || profiles.length === 0) {
        return { error: "Users not found" }
    }


    const inserts = profiles.map(profile => ({
        credential_id: credentialId,
        shared_with: profile.id,
        shared_by: user!.id
    }))

    const { error } = await supabase
        .from("credential_shares")
        .insert(inserts)

    if (error) {
        if (error.code === '23505') return { error: "Credential already shared with some of these users" }
        return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
}

import { createServiceClient } from "@/lib/supabase-admin"

export async function getCredentialShares(credentialId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user && !isDemo) return []

    const userId = user?.id || MOCK_PROFILE.id
    const role = await getUserRole(supabase, userId)

    let hasAccess = false

    if (role === 'Admin') {
        hasAccess = true
    } else {
        const { data: credential } = await supabase
            .from("credentials")
            .select("created_by")
            .eq("id", credentialId)
            .single()

        if (credential?.created_by === userId) {
            hasAccess = true
        } else {
            const { data: myShare } = await supabase
                .from("credential_shares")
                .select("id")
                .eq("credential_id", credentialId)
                .eq("shared_with", userId)
                .single()

            if (myShare) hasAccess = true
        }
    }

    if (!hasAccess && !isDemo) return []

    if (isDemo) {
        return MOCK_USERS.filter(u => u.role !== 'Admin').slice(0, 2).map(u => ({
            id: `share-${u.id}`,
            userId: u.id,
            email: u.email,
            name: u.name
        }))
    }

    const adminSupabase = createServiceClient()

    const { data: shares, error } = await adminSupabase
        .from("credential_shares")
        .select(`
            id,
            profiles:shared_with (
                id,
                email,
                name
            )
        `)
        .eq("credential_id", credentialId)

    if (error) {
        console.error("Error fetching shares:", error)
        return []
    }

    return shares.map((share: any) => ({
        id: share.id, // share record id
        userId: share.profiles.id,
        email: share.profiles.email,
        name: share.profiles.name
    }))
}

export async function removeCredentialShare(credentialId: string, userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isDemo) throw new Error("Unauthorized")

    const currentUserId = user?.id || MOCK_PROFILE.id
    const role = await getUserRole(supabase, currentUserId)

    if (role === "Viewer") {
        return { error: "Viewers cannot remove shares" }
    }

    // Check permissions for Editor
    if (role === "Editor") {
        let isOwner = false
        let isShared = false

        if (isDemo) {
            isOwner = MOCK_CREDENTIALS.some(c => c.id === credentialId)
            isShared = MOCK_SHARED_CREDENTIALS.some(c => c.id === credentialId)
        } else {
            const { data: cred } = await supabase.from("credentials").select("created_by").eq("id", credentialId).single()
            if (cred?.created_by === currentUserId) isOwner = true

            if (!isOwner) {
                // Check if it's shared with this user
                const { data: share } = await supabase.from("credential_shares").select("id").eq("credential_id", credentialId).eq("shared_with", currentUserId).single()
                if (share) isShared = true
            }
        }

        if (!isOwner && !isShared) {
            return { error: "You do not have permission to manage this credential" }
        }
    }

    if (isDemo) {
        console.log(`Mock Remove Share: Credential ${credentialId}, User ${userId}`)
        revalidatePath("/dashboard")
        return { success: true }
    }

    const adminSupabase = createServiceClient()

    const { error } = await adminSupabase
        .from("credential_shares")
        .delete()
        .eq("credential_id", credentialId)
        .eq("shared_with", userId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
}
