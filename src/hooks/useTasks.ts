'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '@/lib/api/tasks';
import { taskKeys } from '@/lib/query-keys';
import { createClient } from '@/lib/supabase/client';

import type { Task } from '@/types/database';

/* ===========================================================================
 * TODO 2 — read the tasks for one project with useQuery
 *
 * Compare what you are about to write with how you did this on Day 2:
 *   useState for data, useState for loading, useState for error, a useEffect,
 *   and a cleanup flag so a slow response could not overwrite a fast one.
 *
 * You will need these three imports:
 *
 *   import { fetchTasks } from '@/lib/api/tasks';
 *   import { taskKeys } from '@/lib/query-keys';
 *   import { createClient } from '@/lib/supabase/client';
 *
 * useQuery needs exactly two things:
 *
 *   queryKey — WHERE this lives in the cache.
 *              Use taskKeys.list(projectId). Never hand-write the array:
 *              one typo and your list silently stops refreshing.
 *   queryFn  — HOW to fetch it when the cache is cold or stale.
 *
 * Return the whole result object; the component destructures what it needs.
 * =========================================================================== */

export function useTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: taskKeys.list(projectId),
    queryFn: async () => {
      const supabase = createClient();
      return fetchTasks(supabase, projectId);
    },
  });
}
 
