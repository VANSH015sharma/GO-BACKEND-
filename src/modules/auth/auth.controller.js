import { getUserById, loginUser, registerUser } from './auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.validated.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.validated.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
}
