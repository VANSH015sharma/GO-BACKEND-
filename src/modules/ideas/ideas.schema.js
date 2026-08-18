import { z } from 'zod';

export const createIdeaSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(10).max(5000),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const ideaIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({}),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'REJECTED']),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({}),
});
