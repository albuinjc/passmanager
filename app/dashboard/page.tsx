import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { CredentialList } from "@/components/credentials/credential-list"
import { MOCK_CREDENTIALS, MOCK_PROFILE, MOCK_USER, MOCK_SHARED_CREDENTIALS } from "@/lib/mock-data"

export default async function DashboardPage() {
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    let user, profile, credentials
    let error = null

    if (isDemo) {
        user = MOCK_USER
        profile = MOCK_PROFILE

        if (profile.role === 'Admin') {
            credentials = [...MOCK_CREDENTIALS, ...MOCK_SHARED_CREDENTIALS]
        } else if (profile.role === 'Editor') {
            credentials = [...MOCK_CREDENTIALS, ...MOCK_SHARED_CREDENTIALS]
        } else {
            credentials = MOCK_SHARED_CREDENTIALS
        }
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

        const { data: creds, error: fetchError } = await supabase
            .from("credentials")
            .select("*")
            .order("created_at", { ascending: false })

        credentials = creds
        error = fetchError
    }

    if (error) {
        console.error("Error fetching credentials:", error)

    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>

            <CredentialList
                initialCredentials={credentials || []}
                currentUserRole={profile?.role}
                currentUserId={user.id}
            />
        </div>
    )
}
