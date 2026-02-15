
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { CredentialList } from "@/components/credentials/credential-list"
import { MOCK_SHARED_CREDENTIALS, MOCK_PROFILE, MOCK_USER } from "@/lib/mock-data"

export default async function SharedPage() {
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    let user, profile, credentials
    let error = null

    if (isDemo) {
        user = MOCK_USER
        profile = MOCK_PROFILE
        credentials = MOCK_SHARED_CREDENTIALS
    } else {
        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()
        user = data.user

        if (!user) {
            redirect("/login")
        }

        const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()
        profile = profileData


        const { data: shares, error: fetchError } = await supabase
            .from('credential_shares')
            .select(`
                 credential:credentials (*)
             `)
            .eq('user_email', user.email)


        if (profile?.role === 'Admin') {
            const { data: creds, error: credError } = await supabase
                .from("credentials")
                .select("*")
                .neq("created_by", user.id)
                .order("created_at", { ascending: false })

            credentials = creds
            error = credError
        } else {
            // Editor / Viewer - show explicitly shared credentials
            const { data: creds, error: credError } = await supabase
                .from("credentials")
                .select("*, credential_shares!inner(shared_with)")
                .eq("credential_shares.shared_with", user.id)
                .order("created_at", { ascending: false })

            credentials = creds
            error = credError
        }
    }

    if (error) {
        console.error("Error fetching shared credentials:", error)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Shared with Me</h1>
            </div>

            <CredentialList
                initialCredentials={credentials || []}
                currentUserRole={profile?.role}
                currentUserId={user.id}
            />
        </div>
    )
}
