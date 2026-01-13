import { z } from 'zod';

export const userSchema = z.object({
  _id: z.string(),
  phoneNumber: z.string()
});

export type User = z.infer<typeof userSchema>;

export const userUpdateSchema = userSchema.partial();

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const createUserSchema = userSchema.omit({_id: true});

export type CreateUserInput = z.infer<typeof createUserSchema>;
