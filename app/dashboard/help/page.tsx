
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>

            <div className="max-w-3xl">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                        <AccordionContent>
                            Currently, password reset is handled by the system administrator. Please contact support.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>How does 2FA work?</AccordionTrigger>
                        <AccordionContent>
                            The application generates Time-based One-Time Passwords (TOTP) compatible with apps like Google Authenticator. The code refreshes every 30 seconds.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Can I share passwords outside the organization?</AccordionTrigger>
                        <AccordionContent>
                            No, secure sharing is restricted to registered users within the organization domain.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}
