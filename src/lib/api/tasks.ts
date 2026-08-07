import type { SupabaseClient } from '@supabase/supabase-js';

import type { CreateTaskInput } from '@/lib/validation/task';
import type { Database, Task, TaskStatus } from '@/types/database';

/* ===========================================================================
 * TODO 1 — the data layer for tasks
 *
 * Model this file on `src/lib/api/projects.ts`, which is already written.
 * Open it, read it, then come back.
 *
 * Two rules that file follows, and so must this one:
 *
 *   1. NO REACT IN HERE. No hooks, no components. These are plain async
 *      functions that would work in a Node script. That separation is why
 *      you can swap Supabase for your own Express API later by rewriting
 *      one folder and nothing else.
 *
 *   2. The Supabase client is a PARAMETER, not an import. There are two of
 *      them — one for the browser, one for the server — and passing it in
 *      means these functions work on both sides.
 *
 * And the thing everyone forgets:
 *
 *      Supabase does NOT throw when a request fails. It hands you
 *      { data, error } and carries on. If you do not check `error` and
 *      throw, `data` is null and you crash three components later with a
 *      useless stack trace — and TanStack Query never shows its error state,
 *      because nothing threw.
 *
 * Delete each `throw new Error('TODO 1 …')` as you implement it.
 * =========================================================================== */

/**
 * SELECT * FROM tasks WHERE project_id = … ORDER BY created_at ASC
 *
 * Hint: supabase.from('tasks').select('*').eq(…).order(…)
 */
export async function fetchTasks(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  return data;
}

/**
 * INSERT one row and hand the created row back.
 *
 * Hint: .insert({ … }).select().single()
 * Without `.select()` the database returns nothing and you have no id.
 *
 * `input.description` is '' when the textarea was left alone — store null
 * instead, so "empty" means the same thing everywhere.
 */
export async function createTask(
  supabase: SupabaseClient<Database>,
  projectId: string,
  userId: string,
  input: CreateTaskInput,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      created_by: userId,
      title: input.title,
      description: input.description || null,
      status: input.status,
      priority: input.priority,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
}

/**
 * UPDATE tasks SET status = … WHERE id = …
 *
 * Hint: .update({ status }).eq('id', taskId).select().single()
 */
export async function updateTaskStatus(
  supabase: SupabaseClient<Database>,
  taskId: string,
  status: TaskStatus,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * DELETE FROM tasks WHERE id = …
 *
 * Nothing to return, so no `.select()` — but still check `error`.
 */
export async function deleteTask(
  supabase: SupabaseClient<Database>,
  taskId: string,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) throw error;
}
