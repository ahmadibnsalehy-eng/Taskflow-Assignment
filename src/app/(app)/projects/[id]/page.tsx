import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TaskForm } from '@/components/tasks/TaskForm';
import { fetchProject } from '@/lib/api/projects';
import { createClient } from '@/lib/supabase/server';

import { Board } from './Board';

/**
 * In Next.js 15 `params` is a PROMISE. In Next 14 it was a plain object.
 *
 * Copy a tutorial written in 2024 and you get `params.id is undefined`. Half
 * the Next.js answers online are still for the old version — always check.
 */
type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const project = await fetchProject(supabase, id);

  return { title: project?.name ?? 'Project' };
}

/* ===========================================================================
 * TODO 8 — the three Next.js conventions
 *
 * (a) generateMetadata, here in this file
 *
 *       export async function generateMetadata({ params }: PageProps) {
 *         const { id } = await params;
 *         const supabase = await createClient();
 *         const project = await fetchProject(supabase, id);
 *         return { title: project?.name ?? 'Project' };
 *       }
 *
 *     It runs on the server before the page renders, and its result becomes
 *     real <title> and <meta> tags in the HTML. That is what Google and
 *     WhatsApp link previews read — something a client-side SPA cannot do
 *     without extra machinery.
 *
 * (b) A new file: src/app/(app)/projects/[id]/loading.tsx
 *
 *       import { BoardSkeleton } from '@/components/ui';
 *       export default function Loading() {
 *         return <BoardSkeleton />;
 *       }
 *
 *     Put a file called loading.tsx in a folder and Next wraps that route in
 *     <Suspense> for you. No configuration, no boilerplate. There is already
 *     one in the parent folder — go and look at it.
 *
 * (c) A new file: src/app/(app)/projects/[id]/error.tsx
 *
 *       'use client';                       ← NOT OPTIONAL
 *       import { ErrorPanel } from '@/components/ui';
 *       export default function ProjectError({
 *         error, reset,
 *       }: { error: Error & { digest?: string }; reset: () => void }) {
 *         return <ErrorPanel message={error.message} onRetry={reset} />;
 *       }
 *
 *     A file called error.tsx turns the route into an error boundary. It MUST
 *     be a client component — error boundaries rely on lifecycle behaviour
 *     that only exists in the browser. Everybody forgets this once. Better
 *     here than in production.
 *
 *     Test it: break the query on purpose (`.from('projects_typo')`), see the
 *     error UI, click Try again, fix it, watch it recover.
 * =========================================================================== */

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const project = await fetchProject(supabase, id);

  // Null means either "no such project" or "RLS said no". Both are a 404 as
  // far as the visitor is concerned — never leak the difference, or you have
  // just told an attacker that the id exists.
  if (!project || !user) notFound();

  return (
    <div className="stack">
      <div>
        <Link href="/projects" className="crumb">
          ← All projects
        </Link>
        <div className="page-head">
          <h1>{project.name}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
      </div>

      {/*
        This page is a server component; only these two children are client
        components. The board's data is fetched in the browser by TanStack
        Query so that it can be cached, refetched and mutated.
      */}
      <TaskForm projectId={project.id} userId={user.id} />
      <Board projectId={project.id} />
    </div>
  );
}
