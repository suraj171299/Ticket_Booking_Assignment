import { z } from "zod"

const lowerCaseRegex = /[a-z]/
const upperCaseRegex = /[A-Z]/
const digitRegex = /\d/
const specialCharRegex = /[^A-Za-z0-9]/


const passwordSchema = z.string()
  .min(8, "Password must be minimum 8 characters long.")
  .refine(val => lowerCaseRegex.test(val), {
    message: "Password must contain at least one lowercase letter.",
  })
  .max(128, "Password must be at most 128 characters.")
  .refine(val => upperCaseRegex.test(val), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine(val => digitRegex.test(val), {
    message: "Password must contain at least one number.",
  })
  .refine(val => specialCharRegex.test(val), {
    message: "Password must contain at least one special character.",
  })

export const registerUserSchema = z.object({
  name: z.string().trim().min(1, "Please provide name.").max(50, "Name must be at most 50 characters.").regex(/^[A-Za-z ]+$/, "Name must contain only letters"),
  email: z.string()
    .trim()
    .min(1, "Please provide email address.")
    .max(254, "Email must be at most 254 characters.")
    .pipe(z.email({ message: "Please provide a valid email address." })),
  password: passwordSchema,
  role: z.enum(['ADMIN', 'USER']).optional()
})


export const loginUserSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Please provide email address.")
    .max(254, "Email must be at most 254 characters.")
    .pipe(z.email({ message: "Please provide a valid email address." })),
  password: z.string()
    .min(1, "Please provide password.")
    .max(16, "Password must be at most 16 characters.")
})

export const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100, "Event name must be at most 100 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, "Use format YYYY-MM-DD HH:mm"),
  location: z.string().min(1, "Event location is required").max(100, "Event location must be at most 100 characters"),
  totalSeats: z.number().int().nonnegative("Total seats must be a non-negative integer")
})

export const updateEventSchema = createEventSchema.partial()