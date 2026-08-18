import { prisma } from '../../lib/prisma.js';

export async function getJobHandler(req, res, next) {
  try {
    const job = await prisma.briefJob.findUnique({
      where: { id: req.validated.params.id },
      include: { idea: true },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.idea.ownerId !== req.user.sub && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(200).json({
      job: {
        id: job.id,
        status: job.status,
        attempts: job.attempts,
        maxAttempts: job.maxAttempts,
        errorMessage: job.errorMessage,
        ideaId: job.ideaId,
      },
    });
  } catch (err) {
    return next(err);
  }
}
