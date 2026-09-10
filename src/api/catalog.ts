import { apiClient } from './client';

// Must match the keys core/designsystem/component/ActivityIcon.kt (app repo) maps to a real
// glyph — assigning an activity a key not in this list still needs an app release.
export const ACTIVITY_ICON_KEYS = ['coffee', 'movie', 'car', 'utensils', 'map', 'shopping_bag', 'walk', 'sparkle'] as const;
export type ActivityIconKey = (typeof ACTIVITY_ICON_KEYS)[number];

export interface Activity {
  id: string;
  name: string;
  iconKey: string;
  description: string | null;
  defaultTitle: string | null;
  defaultDurationMinutes: number | null;
  defaultPriceINR: number | null;
  isActive: boolean;
}

export interface ActivityInput {
  name: string;
  iconKey: ActivityIconKey;
  description?: string;
  defaultTitle?: string;
  defaultDurationMinutes?: number;
  defaultPriceINR?: number;
}

export const catalogApi = {
  listActivities: (): Promise<Activity[]> => apiClient.get('/admin/catalog/activities'),
  createActivity: (input: ActivityInput): Promise<Activity> => apiClient.post('/admin/catalog/activities', input),
  updateActivity: (id: string, input: Partial<ActivityInput>): Promise<Activity> =>
    apiClient.patch(`/admin/catalog/activities/${id}`, input),
  setActive: (id: string, isActive: boolean): Promise<Activity> =>
    apiClient.patch(`/admin/catalog/activities/${id}/active`, { isActive }),
  // Only succeeds if nothing references this activity — hide it instead otherwise.
  deleteActivity: (id: string): Promise<{ deleted: true }> => apiClient.delete(`/admin/catalog/activities/${id}`),
  // orderedIds must be the full current set of activity ids, in the desired display order.
  reorderActivities: (orderedIds: string[]): Promise<Activity[]> =>
    apiClient.post('/admin/catalog/activities/reorder', { orderedIds }),
};
