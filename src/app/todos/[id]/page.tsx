"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Paperclip, RefreshCw } from "lucide-react";
import { TodoProgress } from "@/types/todo";
import CreateTodoProgressForm from "@/components/forms/TodoProgressForm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTodo } from "@/hooks/useTodos";

export default function TodoPage() {
  const router = useRouter();
  const params = useParams();
  const todoId = params.id as string;
  const { data: todo } = useTodo(todoId);

  // Local state for progress updates so we can append optimistically
  const [progressUpdates, setProgressUpdates] = useState<TodoProgress[]>(
    () => todo?.progressUpdates ?? []
  );

  // Ensure chronology and compute latestProgress
  const sortedUpdates = useMemo<TodoProgress[]>(
    () =>
      (progressUpdates ?? []).slice().sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }),
    [progressUpdates]
  );

  // Sync local state whenever todo changes (initial fetch or refetch)
  useEffect(() => {
    setProgressUpdates((prev) => {
      // If todo has updates, use them (ensures canonical order)
      if (todo?.progressUpdates) {
        // sort chronologically to be safe
        return todo.progressUpdates
          .slice()
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
      }
      return prev;
    });
  }, [todo?.progressUpdates]);

  // When user returns to the tab, refresh the page so server/edge caches are revalidated
  useEffect(() => {
    const onFocus = () => {
      router.refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  if (!todo) {
    return (
      <div className="text-center text-red-500 mt-10">Todo not found.</div>
    );
  }



  const latestProgress = sortedUpdates.length
    ? sortedUpdates[sortedUpdates.length - 1].progress
    : todo.progress ?? 0;

  // Called by the CreateTodoProgressForm when a new progress is successfully created.
  // If your form currently doesn't call onAdded, consider updating it to call this with the created item.
  function handleNewProgressAdded(newUpdate?: TodoProgress) {
    // optimistic UI — append the new update if provided
    if (newUpdate) {
      setProgressUpdates((prev) => {
        const next = (prev ?? []).concat(newUpdate);
        return next
          .slice()
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
      });
    }
    // Always refresh server data to keep everything canonical
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Back + Refresh */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push("/todos")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Todos
          </Button>
        </div>
        <div>
          <Button
            variant="ghost"
            onClick={() => router.refresh()}
            className="gap-2"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">{todo.task}</CardTitle>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="default">{todo.status}</Badge>
              <Badge variant="secondary">Priority: {todo.priority}</Badge>
              {todo.type && <Badge variant="outline">Type: {todo.type}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {todo.remark && (
              <p className="text-sm text-muted-foreground">{todo.remark}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoChip
                label="Given Date"
                value={new Date(todo.givenDate).toLocaleDateString()}
              />
              <InfoChip
                label="Due Date"
                value={new Date(todo.dueDate).toLocaleDateString()}
              />
              <InfoChip
                label="Target"
                value={new Date(todo.target).toLocaleDateString()}
              />
              <InfoChip
                label="Department"
                value={todo.department?.name ?? "N/A"}
              />
              <InfoChip label="KPI" value={todo.kpi?.score?.toString() ?? "N/A"} />
              {todo.createdAt && (
                <InfoChip
                  label="Created"
                  value={new Date(todo.createdAt).toLocaleDateString()}
                />
              )}
              {todo.updatedAt && (
                <InfoChip
                  label="Updated"
                  value={new Date(todo.updatedAt).toLocaleDateString()}
                />
              )}
            </div>

            {/* Overall progress */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {latestProgress}%
                </span>
              </div>
              <Progress value={Number(latestProgress || 0)} />
            </div>

            {/* Attachments on todo */}
            {todo.attachment && todo.attachment.length > 0 && (
              <div className="pt-4">
                <h4 className="text-sm font-semibold mb-2">Todo Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {todo.attachment.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border hover:bg-accent text-sm"
                    >
                      <Paperclip className="h-4 w-4" />
                      {url.split("/").pop()}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Add progress form */}
        <div className="space-y-4">
          <CreateTodoProgressForm
            todoId={todoId}
            // keep onClose for backwards compatibility
            onClose={() => {
              // fallback behavior: refresh after close
              router.refresh();
            }}
            // optional: if the form supports returning the created progress object,
            // it should call onAdded(createdProgress) so we can append it locally.
            onAdded={(created?: TodoProgress) => {
              return handleNewProgressAdded(created);
            }}
          />

          {/* Assigned people */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Assigned By
                </div>
                <PersonRow
                  name={
                    todo.assignedBy
                      ? `${todo.assignedBy.first_name} ${todo.assignedBy.last_name ?? ""
                      }`
                      : "N/A"
                  }
                  avatar={todo.assignedBy?.profile_picture}
                />
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Assigned To
                </div>
                <div className="flex flex-wrap gap-2">
                  {(todo.assignedUsers ?? []).length ? (
                    todo.assignedUsers!.map((u) => (
                      <PersonRow
                        key={u.id}
                        name={`${u.first_name} ${u.last_name ?? ""}`}
                        avatar={u.profile_picture}
                        compact
                      />
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">N/A</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Progress Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedUpdates.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No progress updates yet.
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] pr-4">
              <ul className="relative pl-4">
                {/* vertical line */}
                <div className="absolute left-1 top-0 bottom-0 w-[2px] bg-border" />
                {sortedUpdates.map((p, idx) => (
                  <TimelineItem
                    key={p.id ?? idx}
                    index={idx + 1}
                    progress={p.progress}
                    remark={p.remark}
                    createdAt={p.createdAt}
                    attachments={p.attachment}
                    isLast={idx === sortedUpdates.length - 1}
                  />
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function PersonRow({
  name,
  avatar,
  compact,
}: {
  name: string;
  avatar?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 ${compact ? "border px-2 py-1 rounded-md" : ""
        }`}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} />
        <AvatarFallback>{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-sm">{name}</span>
    </div>
  );
}

function TimelineItem({
  index,
  progress,
  remark,
  createdAt,
  attachments,
  author,
  isLast,
}: {
  index: number;
  progress: number;
  remark?: string;
  createdAt: string | Date;
  attachments?: string[];
  author?: {
    id: string;
    first_name: string;
    last_name?: string;
    avatar?: string;
  };
  isLast: boolean;
}) {
  const dateStr = new Date(createdAt).toLocaleString();
  return (
    <li className="relative pl-6 pb-6">
      {/* dot */}
      <div className="absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-background" />
      {/* connector extension (optional) */}
      {!isLast && (
        <div className="absolute left-[2px] top-6 bottom-0 w-[2px] bg-border" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <Badge variant="default">Step {index}</Badge>
          <span className="text-sm text-muted-foreground">{dateStr}</span>
        </div>
        <div className="text-sm font-medium">Progress: {progress}%</div>
      </div>

      {remark && <p className="mt-2 text-sm">{remark}</p>}

      {/* per-update attachments */}
      {attachments && attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 border rounded-md text-sm hover:bg-accent"
            >
              <Paperclip className="h-4 w-4" />
              {url.split("/").pop()}
            </a>
          ))}
        </div>
      )}

      {/* author row */}
      {author && (
        <div className="mt-3 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.avatar} />
            <AvatarFallback>
              {`${author.first_name?.[0] ?? ""}${author.last_name?.[0] ?? ""
                }`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            by {author.first_name} {author.last_name ?? ""}
          </span>
        </div>
      )}
    </li>
  );
}
