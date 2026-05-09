import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { initializeStore, readAchievements, writeAchievements, getNextId } from './store.js';
import { buildAuthContext, issueToken, authenticateToken, requirePermission } from './auth.js';
import { swaggerSpec } from './swagger.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

function parsePermissionsFromQuery(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

app.post('/api/token', (req, res) => {
  try {
    const authContext = buildAuthContext(req.body || {});
    return res.status(200).json(issueToken(authContext));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.get('/api/token', (req, res) => {
  try {
    const authContext = buildAuthContext({
      role: req.query.role,
      permissions: parsePermissionsFromQuery(req.query.permissions),
    });
    return res.status(200).json(issueToken(authContext));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

function parsePagination(req) {
  const rawLimit = Number(req.query.limit ?? 50);
  const rawOffset = Number(req.query.offset ?? 0);

  const limit = Number.isInteger(rawLimit) ? rawLimit : Number.NaN;
  const offset = Number.isInteger(rawOffset) ? rawOffset : Number.NaN;

  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    return { error: 'Query parameter "limit" must be an integer between 1 and 500.' };
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return { error: 'Query parameter "offset" must be an integer greater than or equal to 0.' };
  }

  return { limit, offset };
}

function toAchievementPayload(input, { partial = false } = {}) {
  const output = {};

  if (!partial || Object.hasOwn(input, 'name')) {
    if (typeof input.name !== 'string' || !input.name.trim()) {
      return { error: 'Field "name" must be a non-empty string.' };
    }
    output.name = input.name.trim();
  }

  if (!partial || Object.hasOwn(input, 'group')) {
    if (typeof input.group !== 'string' || !input.group.trim()) {
      return { error: 'Field "group" must be a non-empty string.' };
    }
    output.group = input.group.trim();
  }

  if (!partial || Object.hasOwn(input, 'keywords')) {
    if (!Array.isArray(input.keywords) || input.keywords.some((keyword) => typeof keyword !== 'string' || !keyword.trim())) {
      return { error: 'Field "keywords" must be an array of non-empty strings.' };
    }
    output.keywords = input.keywords.map((keyword) => keyword.trim());
  }

  if (!partial || Object.hasOwn(input, 'projectionRate')) {
    const projectionRate = Number(input.projectionRate ?? 0);
    if (!Number.isFinite(projectionRate) || projectionRate < 0) {
      return { error: 'Field "projectionRate" must be a number greater than or equal to 0.' };
    }
    output.projectionRate = projectionRate;
  }

  if (!partial || Object.hasOwn(input, 'completed')) {
    if (typeof input.completed !== 'boolean' && input.completed !== undefined) {
      return { error: 'Field "completed" must be a boolean.' };
    }
    output.completed = input.completed ?? false;
  }

  if (!partial || Object.hasOwn(input, 'source')) {
    const source = input.source ?? 'custom';
    if (source !== 'base' && source !== 'custom') {
      return { error: 'Field "source" must be either "base" or "custom".' };
    }
    output.source = source;
  }

  return { value: output };
}

app.get('/api/achievements', authenticateToken, requirePermission('READ'), async (req, res) => {
  const paging = parsePagination(req);
  if (paging.error) {
    return res.status(400).json({ message: paging.error });
  }

  const { limit, offset } = paging;
  const achievements = await readAchievements();

  const items = achievements.slice(offset, offset + limit);

  return res.status(200).json({
    items,
    pagination: {
      total: achievements.length,
      limit,
      offset,
      count: items.length,
    },
  });
});

app.get('/api/achievements/:id', authenticateToken, requirePermission('READ'), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Path parameter "id" must be a positive integer.' });
  }

  const achievements = await readAchievements();
  const found = achievements.find((achievement) => achievement.id === id);

  if (!found) {
    return res.status(404).json({ message: 'Achievement not found.' });
  }

  return res.status(200).json(found);
});

app.post('/api/achievements', authenticateToken, requirePermission('WRITE'), async (req, res) => {
  const parsed = toAchievementPayload(req.body || {});
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }

  const achievements = await readAchievements();
  const created = {
    id: getNextId(achievements),
    ...parsed.value,
  };

  achievements.push(created);
  await writeAchievements(achievements);

  res.setHeader('Location', `/api/achievements/${created.id}`);
  return res.status(201).json(created);
});

app.put('/api/achievements/:id', authenticateToken, requirePermission('WRITE'), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Path parameter "id" must be a positive integer.' });
  }

  const parsed = toAchievementPayload(req.body || {}, { partial: true });
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }

  if (Object.keys(parsed.value).length === 0) {
    return res.status(400).json({ message: 'At least one updatable field must be provided.' });
  }

  const achievements = await readAchievements();
  const index = achievements.findIndex((achievement) => achievement.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Achievement not found.' });
  }

  const updated = {
    ...achievements[index],
    ...parsed.value,
    id,
  };

  achievements[index] = updated;
  await writeAchievements(achievements);

  return res.status(200).json(updated);
});

app.delete('/api/achievements/:id', authenticateToken, requirePermission('DELETE'), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: 'Path parameter "id" must be a positive integer.' });
  }

  const achievements = await readAchievements();
  const index = achievements.findIndex((achievement) => achievement.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Achievement not found.' });
  }

  achievements.splice(index, 1);
  await writeAchievements(achievements);

  return res.status(204).send();
});

app.use((err, _req, res) => {
  console.error(err);
  return res.status(500).json({ message: 'Internal server error.' });
});

initializeStore()
  .then(() => {
    app.listen(port, () => {
      console.log(`API server listening on http://localhost:${port}`);
      console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize store:', error);
    process.exit(1);
  });
