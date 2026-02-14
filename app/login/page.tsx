"use client"

import { useState } from "react"
import { login } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function LoginPage() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        const result = await login(formData)
        setLoading(false)
        if (result?.error) {
            toast.error(result.error)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">SecurePass Corp</CardTitle>
                    <CardDescription>Enter your email to sign in to your account</CardDescription>
                </CardHeader>
                <form action={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign up</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
