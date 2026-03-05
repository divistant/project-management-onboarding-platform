"use client";

import { useState } from "react";
import type { OnboardingRequest } from "@/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, Loader2, XCircle, FileText, RefreshCw, Play } from "lucide-react";

const STATUS_ICONS = {
  queued: Circle,
  running: Loader2,
  success: CheckCircle2,
  fail: XCircle,
};

const STATUS_COLORS = {
  queued: "text-muted-foreground",
  running: "text-blue-500 animate-spin",
  success: "text-green-500",
  fail: "text-destructive",
};

export function PipelineView({ request }: { request: OnboardingRequest }) {
  const { startPipeline, addAuditEvent } = useOnboardingStore();
  const [refreshing, setRefreshing] = useState(false);

  const allDone = request.pipeline.every((s) => s.status === "success" || s.status === "fail");
  const isProcessing = request.pipeline.some((s) => s.status === "running");

  const handleRerun = () => {
    setRefreshing(true);
    startPipeline(request.id);
    addAuditEvent({
      id: `aud-rerun-${Date.now()}`,
      onboardingId: request.id,
      userId: "system",
      userName: "System",
      action: "process",
      detail: "Pipeline re-run triggered",
      timestamp: new Date().toISOString(),
    });
    setTimeout(() => setRefreshing(false), 500);
  };

  if (request.pipeline.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Play className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No pipeline has been run yet. Upload documents and start processing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Processing Pipeline</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRerun}
            disabled={isProcessing || refreshing}
          >
            {allDone ? (
              <>
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Re-run
              </>
            ) : (
              <>
                <RefreshCw className={`mr-1 h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} /> Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative pl-8">
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
          {request.pipeline.map((step) => {
            const Icon = STATUS_ICONS[step.status];
            return (
              <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                <div className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                  <Icon className={`h-4 w-4 ${STATUS_COLORS[step.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{step.name}</span>
                    <Badge
                      variant={
                        step.status === "success"
                          ? "default"
                          : step.status === "fail"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {step.completedAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Completed: {new Date(step.completedAt).toLocaleTimeString()}
                    </p>
                  )}
                  {step.logs && step.logs.length > 0 && (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="mt-1"
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          View logs ({step.logs.length})
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="sm:max-w-lg">
                        <SheetHeader>
                          <SheetTitle className="flex items-center gap-2">
                            {step.name}
                            <Badge variant={step.status === "success" ? "default" : step.status === "fail" ? "destructive" : "secondary"}>
                              {step.status}
                            </Badge>
                          </SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
                          <div className="rounded-md bg-zinc-950 p-4 font-mono text-xs leading-relaxed">
                            {step.logs.map((log, i) => {
                              const isError = /error|fail|exception/i.test(log);
                              const isWarn = /warn|warning/i.test(log);
                              const isSuccess = /success|complete|done|passed/i.test(log);
                              return (
                                <div
                                  key={i}
                                  className={`py-0.5 ${isError
                                      ? "text-red-400"
                                      : isWarn
                                        ? "text-amber-400"
                                        : isSuccess
                                          ? "text-green-400"
                                          : "text-zinc-400"
                                    }`}
                                >
                                  <span className="select-none text-zinc-600 mr-3">{String(i + 1).padStart(3, " ")}</span>
                                  {log}
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card >
  );
}
