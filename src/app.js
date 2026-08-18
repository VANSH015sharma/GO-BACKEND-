import express from 'express';
import { router } from './routes/index.js';
import { errorHandler, notFound } from './middleware/error-handler.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/v1', router);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
