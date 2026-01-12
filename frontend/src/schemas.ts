import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const postGigSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().max(2000, 'Description is too long').optional().or(z.literal('')),
  budget: z.coerce
    .number({ invalid_type_error: 'Budget is required' })
    .finite('Budget must be a valid number')
    .positive('Budget must be greater than 0'),
});

export type PostGigInput = z.infer<typeof postGigSchema>;

export const createBidSchema = z.object({
  gigId: z.string().min(1, 'Gig ID is required'),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message is too long'),
  amount: z.coerce
    .number({ invalid_type_error: 'Amount must be a number' })
    .finite('Amount must be a valid number')
    .min(0, 'Amount cannot be negative')
    .optional(),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;

export const fieldErrorsFromZod = (error: z.ZodError) => {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
};
