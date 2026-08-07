'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { useCreateTask } from '@/hooks/useCreateTask';
import { createTaskSchema, type CreateTaskInput } from '@/lib/validation/task';
import { TASK_PRIORITIES } from '@/types/database';

export function TaskForm({ projectId, userId }: { projectId: string; userId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
    },
  });

  const createTask = useCreateTask(projectId, userId);

  async function onSubmit(values: CreateTaskInput) {
    try {
      await createTask.mutateAsync(values);
      reset();
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Could not save the task.',
      });
    }
  }

  return (
    <form className="form card" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field label="Title" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
          placeholder="What needs doing?"
          {...register('title')}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        hint="Optional."
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          rows={2}
          placeholder="Any detail worth remembering…"
          {...register('description')}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
      </Field>

      <div className="form__row">
        <Field label="Priority" htmlFor="priority" error={errors.priority?.message}>
          <Select id="priority" {...register('priority')}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Column" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register('status')}>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </Select>
        </Field>
      </div>

      {errors.root && (
        <p className="field__error" role="alert">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Add task'}
      </Button>
    </form>
  );
}
