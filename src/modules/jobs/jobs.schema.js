import { z } from 'zod';

export const jobIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({}),
});
