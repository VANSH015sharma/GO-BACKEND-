import { z } from 'zod';

const email = z.string().email().max(200);
const password = z.string().min(8).max(100);

export const registerSchema = z.object({
  body: z.object({
    email,
    password,
    role: z.enum(['USER', 'ADMIN']).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password,
  }),
  params: z.object({}),
  query: z.object({}),
});
