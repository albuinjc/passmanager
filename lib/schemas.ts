
import { z } from "zod"

export const credentialSchema = z.object({
    title: z.string().min(1, "Title is required"),
    username: z.string().min(1, "Username/Email is required"),
    password: z.string().min(1, "Password is required"),
    url: z.string().url("Invalid URL").min(1, "URL is required"),
    description: z.string().optional(),
    two_fa_seed: z.string().toUpperCase().regex(/^[A-Z2-7]*$/, "Invalid TOTP Seed (Base32 format required: A-Z, 2-7)").min(10, "TOTP Seed must be at least 10 characters").optional().or(z.literal("")),
})

export type CredentialFormValues = z.infer<typeof credentialSchema>

export const shareSchema = z.object({
    email: z.string().email("Invalid email address"),
})

export const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    description: z.string().optional(),
    role: z.enum(["Admin", "Editor", "Viewer"]),
    active: z.boolean(),
})
