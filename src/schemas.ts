import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(3, "Tytuł musi mieć co najmniej 3 znaki."),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
});

export type TaskFormData = z.infer<typeof taskSchema>;
