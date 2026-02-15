"use client"

import { useEffect, useState } from "react"
import { generate } from "otplib";
import { Progress } from "@/components/ui/progress"
import { Copy, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface TotpViewerProps {
    seed: string
}

export function TotpViewer({ seed }: TotpViewerProps) {
    const [token, setToken] = useState("")
    const [timeLeft, setTimeLeft] = useState(30)
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        if (!seed) return

        const updateToken = async () => {
            if (!seed || seed.length < 10) {
                setToken("ERROR")
                return
            }
            try {
                const newToken = await generate({ secret: seed })
                setToken(newToken)
            } catch (e) {
                setToken("ERROR")
            }
        }

        const updateTimer = () => {
            const definedStep = 30
            const epoch = Math.floor(Date.now() / 1000)
            const count = epoch % definedStep
            const remaining = definedStep - count

            setTimeLeft(remaining)
            setProgress((remaining / definedStep) * 100)


            if (remaining === definedStep) {
                updateToken()
            }
        }


        updateToken()
        updateTimer()

        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [seed])

    const copyToken = () => {
        navigator.clipboard.writeText(token)
        toast.success("2FA Code copied to clipboard")
    }

    return (
        <div className="rounded-md border p-3 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-mono font-bold tracking-widest text-primary">
                        {token === "ERROR" ? <span className="text-sm text-destructive font-normal tracking-normal">Invalid Seed</span> : <>{token.slice(0, 3)} {token.slice(3)}</>}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToken}>
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Clock className="h-3 w-3" />
                    {timeLeft}s
                </div>
            </div>
            <Progress value={progress} className="h-1.5" indicatorClassName="transition-all duration-1000 ease-linear" />
        </div>
    )
}
