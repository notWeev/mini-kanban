import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email."),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy format adresu email."),
    password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne.",
    path: ["confirmPassword"], // Błąd zostanie przypisany do pola confirmPassword
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
