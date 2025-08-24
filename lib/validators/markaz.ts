import { z } from "zod";

export const markazBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
  union: z.string().min(1, "Union is required"),
});

export const createMarkazSchema = markazBaseSchema;
export const updateMarkazSchema = markazBaseSchema.partial(); // allow partial updates if you want PATCH
export type CreateMarkazInput = z.infer<typeof createMarkazSchema>;
export type UpdateMarkazInput = z.infer<typeof updateMarkazSchema>;
