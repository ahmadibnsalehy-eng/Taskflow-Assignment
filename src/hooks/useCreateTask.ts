'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTask } from '@/lib/api/tasks';
import { taskKeys } from '@/lib/query-keys';
import { createClient } from '@/lib/supabase/client';
import type { CreateTaskInput } from '@/lib/validation/task';
import type { Task } from '@/types/database';

/* ===========================================================================
 * TODO 6 — create a task with useMutation
 *
 * useQuery reads. useMutation writes. That is the whole distinction.
 *
 * Imports you will need:
 *
 *   import { useMutation, useQueryClient } from '@tanstack/react-query';
 *   import { createTask } from '@/lib/api/tasks';
 *   import { taskKeys } from '@/lib/query-keys';
 *   import { createClient } from '@/lib/supabase/client';
 *
 * ---------------------------------------------------------------------------
 *   const supabase = createClient();
 *   const queryClient = useQueryClient();
 *
 *   return useMutation({
 *     mutationFn: (input: CreateTaskInput) =>
 *       createTask(supabase, projectId, userId, input),
 *
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: taskKeys.list(projectId) });
 *     },
 *   });
 *
 * That `invalidateQueries` is the line that makes the app feel alive.
 *
 * In English: "the list at this address is out of date — anyone showing it,
 * go and get it again." React Query refetches, and every component using that
 * key updates itself.
 *
 * Notice what you did NOT write: no setTasks([...tasks, newTask]), no lifting
 * state into a common parent, no callback threaded down three levels. You told
 * the cache the truth and the UI followed.
 * =========================================================================== */

export function useCreateTask(projectId: string, userId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: (input) => createTask(supabase, projectId, userId, input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(projectId),
      });
    },
  });
}

