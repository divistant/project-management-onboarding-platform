"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  GitBranch,
  Check,
  Plug,
  Settings2,
  Globe,
  Key,
  FolderGit2,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { GitLabLogo, JiraLogo, AzureDevOpsLogo, TrelloLogo } from "@/components/icons/platform-logos";
import type { ComponentType, SVGProps } from "react";

interface GitLabConfig {
  url: string;
  apiToken: string;
  defaultNamespace: string;
}

interface IntegrationData {
  name: string;
  description: string;
  status: "connected" | "planned";
  logo: ComponentType<SVGProps<SVGSVGElement>>;
  configurable: boolean;
  features: string[];
}

const INTEGRATIONS: IntegrationData[] = [
  {
    name: "GitLab",
    description: "Create projects, wiki pages, issues, labels, and milestones in GitLab",
    status: "connected",
    logo: GitLabLogo,
    configurable: true,
    features: ["Projects", "Wiki Pages", "Issues", "Labels", "Milestones"],
  },
  {
    name: "Jira",
    description: "Create projects, epics, stories, and tasks in Jira",
    status: "planned",
    logo: JiraLogo,
    configurable: false,
    features: ["Projects", "Epics", "Stories", "Tasks"],
  },
  {
    name: "Azure DevOps",
    description: "Create projects, work items, and wiki in Azure DevOps",
    status: "planned",
    logo: AzureDevOpsLogo,
    configurable: false,
    features: ["Projects", "Work Items", "Wiki", "Boards"],
  },
  {
    name: "Trello",
    description: "Create boards, lists, and cards in Trello",
    status: "planned",
    logo: TrelloLogo,
    configurable: false,
    features: ["Boards", "Lists", "Cards"],
  },
];

export default function IntegrationsPage() {
  const [configOpen, setConfigOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<"success" | "idle">("idle");
  const [gitlabConfig, setGitlabConfig] = useState<GitLabConfig>({
    url: "https://gitlab.example.com",
    apiToken: "",
    defaultNamespace: "my-org",
  });
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSaveConfig = () => {
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      setConfigOpen(false);
    }, 1500);
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setConnectionResult("idle");
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionResult("success");
    }, 1500);
  };

  const connectedCount = INTEGRATIONS.filter((i) => i.status === "connected").length;
  const plannedCount = INTEGRATIONS.filter((i) => i.status === "planned").length;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Configure connections to PM tools where generated projects will be created
            </p>
          </div>
        </div>

        {/* Status summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <Wifi className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs">
              <span className="font-medium">{connectedCount}</span> Connected
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs">
              <span className="font-medium">{plannedCount}</span> Planned
            </span>
          </div>
        </div>

        {/* Integration cards */}
        <div className="grid gap-3 md:grid-cols-2">
          {INTEGRATIONS.map((integration) => {
            const isConnected = integration.status === "connected";
            return (
              <Card key={integration.name} className={`gap-0 py-0 transition-shadow hover:shadow-md ${!isConnected ? "opacity-70" : ""}`}>
                <CardContent className="p-0">
                  <div className="px-4 pt-4 pb-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                          <integration.logo className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold">{integration.name}</h3>
                            <Badge
                              variant={isConnected ? "default" : "secondary"}
                              className={`text-[10px] ${isConnected ? "bg-green-600 hover:bg-green-600 text-white" : ""}`}
                            >
                              {isConnected ? "Connected" : "Planned"}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {integration.features.map((feat) => (
                        <span key={feat} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px]">
                          {isConnected && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                          {feat}
                        </span>
                      ))}
                    </div>

                    {/* Config info for GitLab */}
                    {integration.configurable && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-4 rounded-md bg-muted/50 px-3 py-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span className="font-mono">{gitlabConfig.url}</span>
                          </div>
                          <div className="h-3 w-px bg-border" />
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <FolderGit2 className="h-3 w-3" />
                            <span className="font-mono">{gitlabConfig.defaultNamespace}</span>
                          </div>
                          <div className="h-3 w-px bg-border" />
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Key className="h-3 w-3" />
                            <span>{gitlabConfig.apiToken ? "••••••••" : "Not set"}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t px-4 py-2.5">
                    {integration.configurable ? (
                      <>
                        <div className="flex items-center gap-1.5 text-[11px] text-green-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          Live
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setConfigOpen(true)}>
                          <Settings2 className="mr-1.5 h-3 w-3" /> Configure
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <WifiOff className="h-3 w-3" />
                          Not available yet
                        </div>
                        <Badge variant="outline" className="text-[10px]">Coming Soon</Badge>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Configure GitLab Integration
            </DialogTitle>
            <DialogDescription>
              Set up the connection details for your GitLab instance. For demo purposes, any values will be accepted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Instance URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={gitlabConfig.url}
                  onChange={(e) => setGitlabConfig((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://gitlab.example.com"
                  className="h-9 pl-9 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">API Token</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={gitlabConfig.apiToken}
                  onChange={(e) => setGitlabConfig((p) => ({ ...p, apiToken: e.target.value }))}
                  placeholder="glpat-xxxxxxxxxx"
                  className="h-9 pl-9 font-mono text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Personal access token with API scope. This is a mock for demo.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Default Namespace</Label>
              <div className="relative">
                <FolderGit2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={gitlabConfig.defaultNamespace}
                  onChange={(e) => setGitlabConfig((p) => ({ ...p, defaultNamespace: e.target.value }))}
                  placeholder="my-organization"
                  className="h-9 pl-9 font-mono text-sm"
                />
              </div>
            </div>

            {/* Test connection */}
            <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {connectionResult === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Plug className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-xs">
                    {connectionResult === "success" ? (
                      <span className="text-green-600 font-medium">Connection successful</span>
                    ) : (
                      <span className="text-muted-foreground">Test your connection before saving</span>
                    )}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? "Testing..." : "Test Connection"}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            {savedMessage ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <Check className="h-4 w-4" /> Configuration saved!
              </span>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setConfigOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSaveConfig}>Save Configuration</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
