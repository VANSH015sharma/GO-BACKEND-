import { prisma } from '../../lib/prisma.js';
import { cache } from '../../lib/cache.js';
import { idempotencyStore } from '../../lib/idempotency.js';
import { env } from '../../config/env.js';
import { jobQueue } from '../jobs/job-queue.service.js';

const IDEA_CACHE_TTL_MS = 30 * 1000;

function ensureAccessible(idea, user) {
  if (!idea) {
    const err = new Error('Idea not found');
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  if (idea.ownerId !== user.sub && user.role !== 'ADMIN') {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    err.expose = true;
    throw err;
  }
}

export async function createIdea(input, user) {
  const idea = await prisma.idea.create({
    data: {
      title: input.title,
      description: input.description,
      ownerId: user.sub,
    },
  });
  return idea;
}

export async function listIdeas(user) {
  if (user.role === 'ADMIN') {
    return prisma.idea.findMany({ orderBy: { createdAt: 'desc' } });
  }

  return prisma.idea.findMany({
    where: { ownerId: user.sub },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getIdeaById(id, user) {
  const cacheKey = `idea:${user.sub}:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const idea = await prisma.idea.findUnique({ where: { id } });
  ensureAccessible(idea, user);
  cache.set(cacheKey, idea, IDEA_CACHE_TTL_MS);
  return idea;
}

export async function updateIdeaStatus(id, status, user) {
  const idea = await prisma.idea.findUnique({ where: { id } });
  ensureAccessible(idea, user);

  const updated = await prisma.idea.update({ where: { id }, data: { status } });
  cache.del(`idea:${user.sub}:${id}`);
  return updated;
}

export async function requestBrief(ideaId, user, idempotencyKey) {
  if (!idempotencyKey) {
    const err = new Error('Idempotency-Key header is required');
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }

  const existing = idempotencyStore.get(user.sub, idempotencyKey);
  if (existing) return existing;

  const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
  ensureAccessible(idea, user);

  const job = await prisma.briefJob.create({
    data: {
      ideaId,
      status: 'QUEUED',
      promptVersion: env.aiPromptVersion,
      maxAttempts: 3,
    },
  });

  const payload = { jobId: job.id, status: job.status };
  idempotencyStore.set(user.sub, idempotencyKey, payload);
  if (env.nodeEnv !== 'test') {
    jobQueue.enqueue(job.id);
  }
  return payload;
}
