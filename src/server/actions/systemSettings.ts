import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// =============================================================================
// SYSTEM SETTINGS — Key-value store using SystemSetting table
// =============================================================================

/**
 * Default values for known system settings.
 * If a key is not in the DB, the default is returned.
 */
const DEFAULTS: Record<string, unknown> = {
  'editor.autoSaveIntervalMs': 3000,
};

/**
 * Fetch a single system setting by key. Returns the default if not found.
 */
export async function getSystemSetting<T = unknown>(key: string): Promise<T> {
  const row = await prisma.systemSetting.findUnique({ where: { key } });
  if (row) return row.value as T;
  return (DEFAULTS[key] ?? null) as T;
}

/**
 * Fetch multiple system settings at once. Missing keys use defaults.
 */
export async function getSystemSettings(keys: string[]): Promise<Record<string, unknown>> {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: keys } },
  });
  const map: Record<string, unknown> = {};
  for (const key of keys) {
    const row = rows.find((r) => r.key === key);
    map[key] = row ? row.value : (DEFAULTS[key] ?? null);
  }
  return map;
}

/**
 * Fetch ALL system settings (for the settings page).
 */
export async function getAllSystemSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.systemSetting.findMany();
  const map: Record<string, unknown> = { ...DEFAULTS };
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

// Validation schema for upsert
const upsertSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

/**
 * Create or update a system setting.
 */
export async function upsertSystemSetting(
  key: string,
  value: unknown,
  userId?: string,
) {
  upsertSchema.parse({ key, value });
  return prisma.systemSetting.upsert({
    where: { key },
    create: { key, value: value as never, updated_by: userId ?? null },
    update: { value: value as never, updated_by: userId ?? null },
  });
}

/**
 * Bulk upsert multiple settings at once.
 */
export async function upsertSystemSettings(
  settings: Record<string, unknown>,
  userId?: string,
) {
  const ops = Object.entries(settings).map(([key, value]) =>
    prisma.systemSetting.upsert({
      where: { key },
      create: { key, value: value as never, updated_by: userId ?? null },
      update: { value: value as never, updated_by: userId ?? null },
    }),
  );
  return prisma.$transaction(ops);
}
