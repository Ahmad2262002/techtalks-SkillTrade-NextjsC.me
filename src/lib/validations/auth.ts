import { z } from "zod";

export const authSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Node Identifier required" })
        .email({ message: "Invalid Node Identifier format" }),
    password: z
        .string()
        .min(6, { message: "Access Crypt must be at least 6 characters" })
        .max(100, { message: "Access Crypt too long" }),
});

export type AuthSchema = z.infer<typeof authSchema>;
