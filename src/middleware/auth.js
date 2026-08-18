import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || (!header.startsWith('Bearer ') && !header.startsWith('Token '))) {
    const err = new Error('Missing or invalid authorization header');
    err.statusCode = 401;
    err.expose = true;
    return next(err);
  }

  try {
    const token = header.startsWith('Bearer ') ? header.slice(7) : header.slice(6);
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    const err = new Error('Invalid token');
    err.statusCode = 401;
    err.expose = true;
    return next(err);
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      err.expose = true;
      return next(err);
    }
    return next();
  };
}
