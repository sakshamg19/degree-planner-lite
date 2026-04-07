import { z } from "zod";

export const createSemesterSchema = z.object({
  name: z.string().min(1).max(50),
  order: z.number().int().positive(),
});

export const updateSemesterSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    order: z.number().int().positive().optional(),
  })
  .refine((data) => data.name !== undefined || data.order !== undefined, {
    message: "At least one field (name or order) must be provided",
  });
