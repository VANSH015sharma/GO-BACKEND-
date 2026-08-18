import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '7d' },
  );
}

export async function registerUser(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    err.expose = true;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role || 'USER',
    },
  });

  return {
    token: signToken(user),
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function loginUser(input) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    err.expose = true;
    throw err;
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    err.expose = true;
    throw err;
  }

  return {
    token: signToken(user),
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}
