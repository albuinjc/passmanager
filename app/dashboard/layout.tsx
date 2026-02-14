import { Sidebar } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase-server"
import { MOCK_PROFILE } from "@/lib/mock-data"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    let userRole = "Viewer" 

    if (isDemo) {
        userRole = MOCK_PROFILE.role || "Viewer"
    } else {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            redirect("/login")
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (profile) {
            userRole = profile.role
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar for desktop */}
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar className="h-full" userRole={userRole} />
            </div>

            {/* Main Content */}
            <div className="flex-1 md:pl-64 flex flex-col">
                {/* Top bar could go here */}
                <header className="h-16 border-b flex items-center justify-between px-6 bg-background sticky top-0 z-40">
                    <div className="flex items-center gap-4 w-full justify-end">
                        <div className="flex items-center gap-2">
                            {/* Header content removed as per request */}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
