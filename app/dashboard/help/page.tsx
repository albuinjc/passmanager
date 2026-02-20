
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
                    <AccordionItem value="item-4">
                        <AccordionTrigger>What are the different user roles?</AccordionTrigger>
                        <AccordionContent>
                            The system has three roles: Administrator (full control and user management), Editor (can create credentials and edit shared ones), and Viewer (read-only access to credentials shared with them).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                        <AccordionTrigger>Why can&apos;t I edit or delete some credentials?</AccordionTrigger>
                        <AccordionContent>
                            If you are a &apos;Viewer&apos;, you only have read permissions. If you are an &apos;Editor&apos;, you can create credentials and edit those shared with you, but you can only delete credentials you created yourself.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                        <AccordionTrigger>What happens if my account is deactivated?</AccordionTrigger>
                        <AccordionContent>
                            You will immediately lose access to the system. For security reasons, if you have an active session, the system will automatically log you out.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-7">
                        <AccordionTrigger>How do I quickly copy credential data?</AccordionTrigger>
                        <AccordionContent>
                            By clicking the &quot;Copy&quot; buttons (clipboard icon) embedded directly on each credential card.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-8">
                        <AccordionTrigger>Can I delete a credential shared with me?</AccordionTrigger>
                        <AccordionContent>
                            No, only the original creator of the credential or a system Administrator can permanently delete it.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}
