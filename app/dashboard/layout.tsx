import { Sidebar } from "@/components/ui/sidebar"
import { MobileNav } from "@/components/ui/mobile-nav"
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
    let userName = ""
    let userEmail = ""

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
            .select("role, name, email")
            .eq("id", user.id)
            .single()

        if (profile) {
            userRole = profile.role
            userName = profile.name
            userEmail = profile.email
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar for desktop */}
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar className="h-full" userRole={userRole} userName={userName} userEmail={userEmail} />
            </div>

            {/* Main Content */}
            <div className="flex-1 md:pl-64 flex flex-col">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center p-4 border-b bg-background sticky top-0 z-40">
                    <MobileNav userRole={userRole} userName={userName} userEmail={userEmail} />
                    <span className="ml-2 font-bold text-lg">SecurePass</span>
                </div>

                {/* Desktop Header (hidden on mobile) */}
                <header className="hidden md:flex h-16 border-b items-center justify-between px-6 bg-background sticky top-0 z-40">
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
