import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { apiRateLimiter, authRateLimiter } from '../middleware/rate-limit.js';
import { login, me, register } from '../modules/auth/auth.controller.js';
import { loginSchema, registerSchema } from '../modules/auth/auth.schema.js';
import {
  createIdeaHandler,
  getIdeaHandler,
  listIdeasHandler,
  requestBriefHandler,
  updateIdeaStatusHandler,
} from '../modules/ideas/ideas.controller.js';
import { createIdeaSchema, ideaIdSchema, updateStatusSchema } from '../modules/ideas/ideas.schema.js';
import { getJobHandler } from '../modules/jobs/jobs.controller.js';
import { jobIdSchema } from '../modules/jobs/jobs.schema.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.post('/auth/register', authRateLimiter, validate(registerSchema), register);
router.post('/auth/login', authRateLimiter, validate(loginSchema), login);
router.get('/me', apiRateLimiter, requireAuth, me);

router.post('/ideas', apiRateLimiter, requireAuth, validate(createIdeaSchema), createIdeaHandler);
router.get('/ideas', apiRateLimiter, requireAuth, listIdeasHandler);
router.get('/ideas/:id', apiRateLimiter, requireAuth, validate(ideaIdSchema), getIdeaHandler);
router.patch('/ideas/:id/status', apiRateLimiter, requireAuth, validate(updateStatusSchema), updateIdeaStatusHandler);
router.post('/ideas/:id/brief', apiRateLimiter, requireAuth, validate(ideaIdSchema), requestBriefHandler);

router.get('/jobs/:id', apiRateLimiter, requireAuth, requireRole('USER', 'ADMIN'), validate(jobIdSchema), getJobHandler);
