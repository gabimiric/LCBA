import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFilePath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFilePath), '..');
const dbDir = path.join(repoRoot, 'server', 'data');
const dbFilePath = path.join(dbDir, 'achievements.db.json');
const seedFilePath = path.join(repoRoot, 'src', 'data', 'achievements.json');

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function initializeStore() {
  await mkdir(dbDir, { recursive: true });

  if (await fileExists(dbFilePath)) {
    return;
  }

  const seedDataRaw = await readFile(seedFilePath, 'utf8');
  const seedData = JSON.parse(seedDataRaw);
  const normalizedSeedData = seedData.map((item) => ({
    ...item,
    source: 'base',
  }));

  await writeFile(dbFilePath, JSON.stringify(normalizedSeedData, null, 2), 'utf8');
}

export async function readAchievements() {
  const raw = await readFile(dbFilePath, 'utf8');
  return JSON.parse(raw);
}

export async function writeAchievements(achievements) {
  await writeFile(dbFilePath, JSON.stringify(achievements, null, 2), 'utf8');
}

export function getNextId(achievements) {
  const maxId = achievements.reduce((max, achievement) => {
    return Number.isFinite(achievement.id) ? Math.max(max, achievement.id) : max;
  }, 0);

  return maxId + 1;
}
