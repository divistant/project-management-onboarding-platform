"use client";

import { useState, useMemo } from "react";
import type { OnboardingRequest } from "@/types/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Sparkles, List, AlignLeft, Code2 } from "lucide-react";

const AI_KEYWORDS = ["scope", "goal", "assumption", "requirement", "risk", "objective"];

function isAIKeySection(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_KEYWORDS.some((k) => lower.includes(k));
}

export function ExtractedContentView({ request }: { request: OnboardingRequest }) {
  const [viewMode, setViewMode] = useState<"structured" | "raw">("structured");
  const [selectedDocId, setSelectedDocId] = useState(request.documents[0]?.id || "");

  const selectedDoc = request.documents.find((d) => d.id === selectedDocId);
  const sections = useMemo(
    () => extractSections(selectedDoc?.extractedMarkdown || ""),
    [selectedDoc]
  );

  if (request.documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">No extracted content available</p>
          <p className="text-xs text-muted-foreground mt-1">Upload documents and run the pipeline to extract content.</p>
        </CardContent>
      </Card>
    );
  }

  const scrollToSection = (title: string) => {
    const el = document.getElementById(`section-${title.replace(/\s+/g, "-").toLowerCase()}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Extracted Content</CardTitle>
          <div className="inline-flex items-center rounded-lg border bg-muted p-0.5 text-sm">
            <button
              onClick={() => setViewMode("structured")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "structured"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlignLeft className="h-3.5 w-3.5" />
              Structured
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "raw"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Raw Markdown
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedDocId} onValueChange={setSelectedDocId}>
          <TabsList>
            {request.documents.map((doc) => (
              <TabsTrigger key={doc.id} value={doc.id}>
                {doc.type}: {doc.name.length > 20 ? doc.name.slice(0, 20) + "..." : doc.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {request.documents.map((doc) => {
            const docSections = extractSections(doc.extractedMarkdown || "");
            return (
              <TabsContent key={doc.id} value={doc.id}>
                <div className="grid grid-cols-12 gap-4">
                  {viewMode === "structured" && docSections.length > 0 && (
                    <div className="col-span-3">
                      <div className="sticky top-0">
                        <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                          <List className="h-3 w-3" /> Table of Contents
                        </p>
                        <ScrollArea className="h-[380px]">
                          <div className="space-y-0.5">
                            {docSections.map((section, i) => (
                              <button
                                key={i}
                                className="flex w-full items-center gap-1 rounded-sm px-2 py-1 text-left text-xs hover:bg-muted"
                                onClick={() => scrollToSection(section.title)}
                              >
                                {isAIKeySection(section.title) && (
                                  <Sparkles className="h-3 w-3 shrink-0 text-amber-500" />
                                )}
                                <span className="truncate">{section.title}</span>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  )}

                  <div className={viewMode === "structured" && docSections.length > 0 ? "col-span-9" : "col-span-12"}>
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      {viewMode === "structured" ? (
                        <div className="space-y-4">
                          {docSections.map((section, i) => (
                            <div
                              key={i}
                              id={`section-${section.title.replace(/\s+/g, "-").toLowerCase()}`}
                              className={
                                isAIKeySection(section.title)
                                  ? "rounded-md border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-3"
                                  : ""
                              }
                            >
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-primary">
                                  {section.title}
                                </h3>
                                {isAIKeySection(section.title) && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-400 text-amber-600">
                                    <Sparkles className="mr-0.5 h-2.5 w-2.5" /> AI Extracted
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                {section.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                          {doc.extractedMarkdown || "No content."}
                        </pre>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function extractSections(markdown: string) {
  const lines = markdown.split("\n");
  const sections: { title: string; content: string }[] = [];
  let current: { title: string; content: string } | null = null;

  for (const line of lines) {
    if (line.startsWith("## ") || line.startsWith("# ")) {
      if (current) sections.push(current);
      current = { title: line.replace(/^#+\s*/, ""), content: "" };
    } else if (current) {
      current.content += line + "\n";
    }
  }
  if (current) sections.push(current);
  return sections;
}
