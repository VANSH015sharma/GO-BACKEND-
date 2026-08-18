import {
  createIdea,
  getIdeaById,
  listIdeas,
  requestBrief,
  updateIdeaStatus,
} from './ideas.service.js';

export async function createIdeaHandler(req, res, next) {
  try {
    const idea = await createIdea(req.validated.body, req.user);
    res.status(201).json({ idea });
  } catch (err) {
    next(err);
  }
}

export async function listIdeasHandler(req, res, next) {
  try {
    const ideas = await listIdeas(req.user);
    res.status(200).json({ ideas });
  } catch (err) {
    next(err);
  }
}

export async function getIdeaHandler(req, res, next) {
  try {
    const idea = await getIdeaById(req.validated.params.id, req.user);
    res.status(200).json({ idea });
  } catch (err) {
    next(err);
  }
}

export async function updateIdeaStatusHandler(req, res, next) {
  try {
    const updated = await updateIdeaStatus(req.validated.params.id, req.validated.body.status, req.user);
    res.status(200).json({ idea: updated });
  } catch (err) {
    next(err);
  }
}

export async function requestBriefHandler(req, res, next) {
  try {
    const key = req.headers['idempotency-key'];
    const result = await requestBrief(req.validated.params.id, req.user, key);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
}
