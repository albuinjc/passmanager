
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserTable } from "@/components/users/user-table"
import { MOCK_USERS } from "@/lib/mock-data"

export default async function SettingsPage() {
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    let users = []
    let currentUserId: string | undefined

    if (isDemo) {
        users = MOCK_USERS
        currentUserId = 'mock-user-id'
    } else {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            redirect("/login")
        }

        currentUserId = user.id

        const { data: currentUserProfile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (currentUserProfile?.role !== "Admin") {
            redirect("/dashboard")
        }



        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })

        if (profiles) {
            users = profiles
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="grid gap-6">
                {/* User Management Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage users, roles, and access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserTable initialUsers={users} currentUserId={currentUserId} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
