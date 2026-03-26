import { withAccess } from '@/server/middleware/withAccess';
import {
  getAllSystemSettings,
  getSystemSetting,
  upsertSystemSettings,
} from '@/server/actions/systemSettings';

// GET /api/settings/system?key=editor.autoSaveIntervalMs
// If no key param, returns all settings
export const GET = withAccess('settings:read', async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');

  if (key) {
    const value = await getSystemSetting(key);
    return Response.json({ data: { [key]: value } });
  }

  const all = await getAllSystemSettings();
  return Response.json({ data: all });
});

// PATCH /api/settings/system
// Body: { settings: { "editor.autoSaveIntervalMs": 5000 } }
export const PATCH = withAccess('settings:manage', async (req, _ctx, session) => {
  const body = await req.json();
  const settings = body.settings as Record<string, unknown> | undefined;

  if (!settings || typeof settings !== 'object') {
    return Response.json(
      { error: { code: 'INVALID_INPUT', message: 'settings object is required' } },
      { status: 400 },
    );
  }

  await upsertSystemSettings(settings, session.user.id);
  return Response.json({ data: settings });
});
