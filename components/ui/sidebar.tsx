"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    LayoutDashboard,
    Key,
    Share2,
    Settings,
    HelpCircle,
    LogOut,
    CreditCard,
    FileText,
    ShieldCheck
} from "lucide-react"

import { signout } from "@/app/auth/actions"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    userRole?: string
    userName?: string
    userEmail?: string
}

export function Sidebar({ className, userRole, userName, userEmail }: SidebarProps) {
    const pathname = usePathname()

    const items = [
        {
            title: "GENERAL",
            items: [
                {
                    title: "Dashboard",
                    href: "/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    title: "Credentials",
                    href: "/dashboard/credentials",
                    icon: Key,
                },
                {
                    title: "Shared",
                    href: "/dashboard/shared",
                    icon: Share2,
                },
            ],
        },
        {
            title: "SUPPORT",
            items: [
                {
                    title: "Settings",
                    href: "/dashboard/settings",
                    icon: Settings,
                    hidden: userRole !== 'Admin',
                },
                {
                    title: "Help",
                    href: "/dashboard/help",
                    icon: HelpCircle,
                },
            ],
        },
    ]

    const handleSignOut = async () => {
        try {
            await fetch("/auth/signout", { method: "POST" })
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    return (
        <div className={cn("pb-12 h-screen border-r bg-background", className)}>
            <div className="space-y-4 py-4 h-full flex flex-col">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        SecurePass
                    </h2>
                </div>
                <div className="flex-1 px-3">
                    {items.map((group, i) => (
                        <div key={i} className="mb-8">
                            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-wider">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.filter(item => !item.hidden).map((item) => (
                                    <Button
                                        key={item.href}
                                        variant={pathname === item.href ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start",
                                            pathname === item.href && "font-semibold"
                                        )}
                                        asChild
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Profile Section at Bottom */}
                <div className="mt-auto px-4 py-4 border-t">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-sm font-medium">{userName ? userName.substring(0, 2).toUpperCase() : "JD"}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{userName}</p>
                            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                        </div>
                        <form action={signout}>
                            <Button variant="ghost" size="icon" className="h-8 w-8" type="submit">
                                <LogOut className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
