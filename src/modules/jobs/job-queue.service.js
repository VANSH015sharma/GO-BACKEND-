import { prisma } from '../../lib/prisma.js';
import { generateBrief } from '../../services/ai-brief.service.js';
import { logger } from '../../lib/logger.js';

class JobQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  enqueue(jobId) {
    this.queue.push(jobId);
    this.process().catch((err) => logger.error({ err }, 'queue processing failed'));
  }

  async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const jobId = this.queue.shift();
      // eslint-disable-next-line no-await-in-loop
      await this.handleJob(jobId);
    }

    this.processing = false;
  }

  async handleJob(jobId) {
    const job = await prisma.briefJob.findUnique({
      where: { id: jobId },
      include: { idea: true },
    });

    if (!job || job.status === 'COMPLETED') return;

    await prisma.briefJob.update({
      where: { id: job.id },
      data: { status: 'PROCESSING', attempts: { increment: 1 } },
    });

    try {
      const result = await generateBrief(job.idea);
      await prisma.idea.update({
        where: { id: job.ideaId },
        data: {
          aiBrief: result.content,
          aiBriefVersion: result.promptVersion,
        },
      });
      await prisma.briefJob.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', errorMessage: null },
      });
    } catch (err) {
      const canRetry = job.attempts + 1 < job.maxAttempts;
      await prisma.briefJob.update({
        where: { id: job.id },
        data: {
          status: canRetry ? 'QUEUED' : 'FAILED',
          errorMessage: err.message,
        },
      });

      if (canRetry) {
        const backoffMs = 400 * 2 ** job.attempts;
        setTimeout(() => this.enqueue(job.id), backoffMs);
      }
    }
  }
}

export const jobQueue = new JobQueue();
