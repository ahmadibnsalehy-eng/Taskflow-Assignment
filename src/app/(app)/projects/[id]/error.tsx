'use client';

import { ErrorPanel } from '@/components/ui';

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPanel
      title="Could not load this project"
      message={error.message}
      onRetry={reset}
    />
  );
}
