"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Sidebar } from "@/components/ui/sidebar"

interface MobileNavProps {
    userRole?: string
    userName?: string
    userEmail?: string
}

export function MobileNav({ userRole, userName, userEmail }: MobileNavProps) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Close the sheet when the route changes
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r w-72">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation sidebar</SheetDescription>
                <Sidebar
                    className="border-none w-full pb-32"
                    userRole={userRole}
                    userName={userName}
                    userEmail={userEmail}
                />
            </SheetContent>
        </Sheet>
    )
}
