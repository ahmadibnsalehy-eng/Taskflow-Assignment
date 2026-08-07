import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/types/database';
/* ===========================================================================
 * TODO 4 — the task schema
 *
 * Before the form comes the rules. And the rules do not live in the form.
 *
 * Open `supabase/schema.sql` and find the tasks table. You are about to write
 * the SAME rules a second time:
 *
 *   SQL   title text not null check (char_length(title) between 3 and 120)
 *   Zod   title: z.string().trim().min(3).max(120)
 *
 * That is deliberate, not duplication for its own sake:
 *
 *   Zod's job      → a friendly red message under the input.   (UX)
 *   The database's → make it impossible.                        (security)
 *
 * With only Zod, anyone can bypass your form with curl. With only the
 * constraint, users get a raw Postgres error in the face.
 * VALIDATE AT EVERY BOUNDARY.
 *
 * ---------------------------------------------------------------------------
 * Build `createTaskSchema` with four fields:
 *
 *   title        3–120 characters, trimmed, with your own error messages
 *   description  optional, max 2000 — but an untouched <textarea> gives you
 *                '' rather than undefined, so allow the empty string too
 *                (hint: .optional().or(z.literal('')))
 *   status       one of TASK_STATUSES     (import from '@/types/database')
 *   priority     one of TASK_PRIORITIES   (same import)
 *
 * Then export the type. THE SCHEMA IS THE TYPE:
 *
 *   export type CreateTaskInput = z.infer<typeof createTaskSchema>;
 *
 * One line, and TypeScript knows the exact shape. You never hand-write an
 * interface that can quietly drift away from your validation. Change the
 * schema and every file that is now wrong lights up red. One source of truth.
 * =========================================================================== */

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(120, 'Title must be at most 120 characters.'),

  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters.')
    .optional()
    .or(z.literal('')),

  status: z.enum(TASK_STATUSES),

  priority: z.enum(TASK_PRIORITIES),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
