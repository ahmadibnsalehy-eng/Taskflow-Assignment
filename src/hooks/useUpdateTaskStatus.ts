'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaskStatus } from '@/lib/api/tasks';
import { taskKeys } from '@/lib/query-keys';
import { createClient } from '@/lib/supabase/client';
import type { Task, TaskStatus } from '@/types/database';

/* ===========================================================================
 * TODO 7 — move a task between columns. OPTIMISTIC UPDATE.
 *
 * Build the simple version first and feel the problem: move a card and there
 * is a visible pause while it waits for a server in London. On campus wi-fi
 * that is half a second. On mobile data it is two.
 *
 * Linear, Notion and Trello all feel instant. Their servers are not faster.
 * They update the screen BEFORE the server answers, and quietly put it back
 * if the server says no. That is all this is.
 *
 * Imports you will need:
 *
 *   import { useMutation, useQueryClient } from '@tanstack/react-query';
 *   import { updateTaskStatus } from '@/lib/api/tasks';
 *   import { taskKeys } from '@/lib/query-keys';
 *   import { createClient } from '@/lib/supabase/client';
 *
 * ---------------------------------------------------------------------------
 *   const queryKey = taskKeys.list(projectId);
 *
 *   return useMutation({
 *     mutationFn: ({ id, status }) => updateTaskStatus(supabase, id, status),
 *
 *     // 1. Runs BEFORE the request goes out.
 *     onMutate: async ({ id, status }) => {
 *       await queryClient.cancelQueries({ queryKey });
 *       //   ^ a refetch may already be in flight carrying the OLD data. If it
 *       //     lands after our edit it overwrites it and the card snaps back.
 *
 *       const previous = queryClient.getQueryData<Task[]>(queryKey);
 *       //   ^ our undo button. Keep the truth before we tell the lie.
 *
 *       queryClient.setQueryData<Task[]>(queryKey, (old) =>
 *         old?.map((task) => (task.id === id ? { ...task, status } : task)),
 *       );
 *       //   ^ the lie. Edit the cache directly and the UI updates this frame,
 *       //     with no network involved.
 *
 *       return { previous };   // arrives in onError as `context`
 *     },
 *
 *     // 2. The server refused. Put it back.
 *     onError: (_error, _variables, context) => {
 *       if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
 *     },
 *     //   Being able to undo the lie is what separates an optimistic update
 *     //   from a bug.
 *
 *     // 3. Success or failure, resync so client and server cannot drift.
 *     onSettled: () => {
 *       queryClient.invalidateQueries({ queryKey });
 *     },
 *   });
 *
 * ---------------------------------------------------------------------------
 * PROVE THE ROLLBACK: DevTools → Network → throttling → Offline. Move a card.
 * It moves instantly, then snaps back. Instant feedback, honest correction.
 *
 * WHEN TO USE THIS: only where the mutation almost always succeeds and the
 * change is small and reversible — status toggles, likes, reordering, marking
 * as read. Never optimistically render "Payment successful".
 * =========================================================================== */

export function useUpdateTaskStatus(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const queryKey = taskKeys.list(projectId);

  return useMutation<
    Task,
    Error,
    { id: string; status: TaskStatus },
    { previous?: Task[] }
  >({
    mutationFn: ({ id, status }) =>
      updateTaskStatus(supabase, id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Task[]>(queryKey);

      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.map((task) =>
          task.id === id ? { ...task, status } : task,
        ),
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
