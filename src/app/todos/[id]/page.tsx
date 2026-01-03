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
      <div className="text-center text-destructive mt-10">Todo not found.</div>
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
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-muted/30 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/todos")}
            className="p-2 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border text-muted-foreground hover:text-primary shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
              Todo Details
            </h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform cursor-pointer" onClick={() => router.refresh()} />
              Status: {todo.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Badge className={`w-full sm:w-auto flex justify-center py-1.5 text-[10px] font-black uppercase tracking-widest ${todo.priority === 'High' || todo.priority === 'Urgent' ? 'bg-destructive/10 text-destructive' :
            todo.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
              'bg-primary/10 text-primary'
            }`}>
            {todo.priority} Priority
          </Badge>
          {todo.type && (
            <Badge variant="outline" className="w-full sm:w-auto flex justify-center py-1.5 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
              {todo.type}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-background rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-primary" />
              Task Description
            </h2>
            <h3 className="text-lg font-bold text-foreground mb-4">{todo.task}</h3>
            {todo.remark && (
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground italic whitespace-pre-wrap leading-relaxed">
                  {todo.remark}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              <InfoChip label="Given Date" value={new Date(todo.givenDate).toLocaleDateString()} />
              <InfoChip label="Due Date" value={new Date(todo.dueDate).toLocaleDateString()} />
              <InfoChip label="Target" value={todo.target_date ? new Date(todo.target_date).toLocaleDateString() : "-"} />
              <InfoChip label="Department" value={todo.department?.name ?? "N/A"} />
              <InfoChip label="KPI" value={todo.kpi?.score?.toString() ?? "N/A"} />
              <InfoChip label="Created At" value={new Date(todo.createdAt!).toLocaleDateString()} />
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Task Completion</span>
                <span className="text-primary">{latestProgress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${latestProgress}%` }}
                />
              </div>
            </div>

            {todo.attachment && todo.attachment.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border/50">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {todo.attachment.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border hover:border-primary/20 hover:bg-primary/5 transition-all text-xs font-bold text-muted-foreground hover:text-primary shadow-sm"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                      <span className="truncate max-w-[150px]">{url.split("/").pop()}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                Progress Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {sortedUpdates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                  <RefreshCw className="w-8 h-8 text-muted-foreground mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No progress updates yet</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[60vh]">
                  <ul className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-primary/30 before:to-transparent">
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

        <div className="space-y-6">
          <section className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="bg-muted/30 border-b border-border px-6 py-4">
              <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                Update Progress
              </h2>
            </div>
            <div className="p-6 bg-gradient-to-br from-background to-muted/30">
              <CreateTodoProgressForm
                todoId={todoId}
                onClose={() => router.refresh()}
                onAdded={(created?: TodoProgress) => handleNewProgressAdded(created)}
              />
            </div>
          </section>

          <section className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="bg-muted/30 border-b border-border px-6 py-4">
              <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                Stakeholders
              </h2>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Assigned By</p>
                <PersonRow
                  name={todo.assignedBy ? `${todo.assignedBy.first_name} ${todo.assignedBy.last_name ?? ""}` : "N/A"}
                  avatar={todo.assignedBy?.profile_picture}
                />
              </div>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Assigned To</p>
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
                    <span className="text-sm font-bold text-muted-foreground italic">No users assigned</span>
                  )}
                </div>
              </div>
            </CardContent>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4 bg-muted/30 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{label}</div>
      <div className="text-xs font-bold text-foreground">{value}</div>
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
      className={`inline-flex items-center gap-3 transition-all ${compact ? "px-3 py-1.5 rounded-xl bg-muted/30 border border-border hover:border-primary/20 hover:bg-primary/5 shadow-sm" : ""
        }`}
    >
      <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
        <AvatarImage src={avatar} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
          {name?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-bold text-foreground truncate max-w-[120px]">{name}</span>
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
    <li className="relative pl-12 pb-10 last:pb-0">
      <div className="absolute left-0 mt-1.5 h-10 w-10 rounded-xl bg-background border-2 border-primary flex items-center justify-center z-10 shadow-sm">
        <span className="text-[10px] font-black text-primary">{index}</span>
      </div>

      <div className="bg-background rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3">
          <Badge className="bg-primary/5 text-primary border-primary/10 text-[10px] font-black uppercase tracking-widest">
            {progress}%
          </Badge>
        </div>

        <div className="flex flex-col gap-1 mb-3">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Update Added</p>
          <p className="text-xs font-bold text-muted-foreground italic">{dateStr}</p>
        </div>

        {remark && (
          <div className="bg-muted/30 p-4 rounded-xl border border-border mb-4">
            <p className="text-sm text-foreground leading-relaxed italic">
              {remark}
            </p>
          </div>
        )}

        {attachments && attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {attachments.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="group/file flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-primary/5 hover:border-primary/20 transition-all text-[10px] font-bold text-muted-foreground hover:text-primary shadow-sm"
              >
                <Paperclip className="h-3 w-3 text-muted-foreground group-hover/file:text-primary" />
                <span>{url.split("/").pop()}</span>
              </a>
            ))}
          </div>
        )}

        {author && (
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.avatar} />
              <AvatarFallback className="bg-primary/5 text-primary text-[10px] uppercase">
                {`${author.first_name?.[0] ?? ""}${author.last_name?.[0] ?? ""}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              By {author.first_name} {author.last_name ?? ""}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}
