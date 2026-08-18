import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'file:./test.db';
process.env.AI_PROMPT_VERSION = 'test-v1';

const { createApp } = await import('../src/app.js');
const { prisma } = await import('../src/lib/prisma.js');

const app = createApp();

async function cleanup() {
  await prisma.briefJob.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.user.deleteMany();
}

test.beforeEach(async () => {
  await cleanup();
});

test.after(async () => {
  await cleanup();
  await prisma.$disconnect();
});

test('register, login and access profile', async () => {
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'u1@example.com', password: 'Password123!' });

  assert.equal(registerRes.statusCode, 201);
  assert.ok(registerRes.body.token);

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'u1@example.com', password: 'Password123!' });

  assert.equal(loginRes.statusCode, 200);

  const meRes = await request(app)
    .get('/api/v1/me')
    .set('Authorization', 'Token ' + loginRes.body.token);

  assert.equal(meRes.statusCode, 200);
  assert.equal(meRes.body.user.email, 'u1@example.com');
});

test('idea workflow and idempotent brief request', async () => {
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'u2@example.com', password: 'Password123!' });

  const token = registerRes.body.token;

  const createRes = await request(app)
    .post('/api/v1/ideas')
    .set('Authorization', 'Token ' + token)
    .send({
      title: 'AI Sprint Planner',
      description: 'A backend product that creates sprint plans from product requirements.',
    });

  assert.equal(createRes.statusCode, 201);

  const ideaId = createRes.body.idea.id;

  const brief1 = await request(app)
    .post(`/api/v1/ideas/${ideaId}/brief`)
    .set('Authorization', 'Token ' + token)
    .set('Idempotency-Key', 'same-key');

  const brief2 = await request(app)
    .post(`/api/v1/ideas/${ideaId}/brief`)
    .set('Authorization', 'Token ' + token)
    .set('Idempotency-Key', 'same-key');

  assert.equal(brief1.statusCode, 202);
  assert.equal(brief2.statusCode, 202);
  assert.equal(brief1.body.jobId, brief2.body.jobId);
});
