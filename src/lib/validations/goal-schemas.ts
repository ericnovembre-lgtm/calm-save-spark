import { z } from "zod";

// Goal creation/edit validation
export const goalSchema = z.object({
  name: z.string()
    .min(1, "Goal name is required")
    .max(50, "Goal name must be less than 50 characters")
    .trim(),
  target_amount: z.coerce.number()
    .positive("Target amount must be greater than $0")
    .max(10000000, "Target amount must be less than $10,000,000")
    .refine((val) => val >= 1, "Minimum target is $1"),
  deadline: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) > new Date();
    }, "Deadline must be in the future")
});

// Contribution validation
export const contributionSchema = z.object({
  amount: z.coerce.number()
    .positive("Amount must be greater than $0")
    .max(1000000, "Single contribution cannot exceed $1,000,000"),
  date: z.string().optional(),
  note: z.string().max(200, "Note must be less than 200 characters").optional()
});

export type GoalFormData = z.infer<typeof goalSchema>;
export type ContributionFormData = z.infer<typeof contributionSchema>;
