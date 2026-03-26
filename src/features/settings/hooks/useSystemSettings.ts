import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSystemSettingsApi,
  fetchSystemSettingApi,
  updateSystemSettingsApi,
} from '../api';

const systemSettingsKey = ['system-settings'] as const;
const systemSettingKey = (key: string) => ['system-settings', key] as const;

/**
 * Fetch all system settings.
 */
export function useSystemSettings() {
  return useQuery({
    queryKey: systemSettingsKey,
    queryFn: fetchSystemSettingsApi,
    staleTime: 5 * 60 * 1000, // 5 min — settings rarely change
  });
}

/**
 * Fetch a single system setting by key.
 * Returns the value directly (not the wrapper object).
 */
export function useSystemSetting<T = unknown>(key: string) {
  return useQuery({
    queryKey: systemSettingKey(key),
    queryFn: async () => {
      const data = await fetchSystemSettingApi(key);
      return (data[key] ?? null) as T;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation to update one or more system settings.
 */
export function useUpdateSystemSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, unknown>) =>
      updateSystemSettingsApi(settings),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: systemSettingsKey });
      // Also invalidate individual keys
      for (const key of Object.keys(variables)) {
        qc.invalidateQueries({ queryKey: systemSettingKey(key) });
      }
    },
  });
}
