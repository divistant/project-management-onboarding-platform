"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Check,
    Globe,
    Key,
    FolderGit2,
    Plug,
    CheckCircle2,
    GitBranch,
} from "lucide-react";

export function GitlabSettings() {
    const [url, setUrl] = useState("https://gitlab.example.com");
    const [apiToken, setApiToken] = useState("");
    const [namespace, setNamespace] = useState("my-org");
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionResult, setConnectionResult] = useState<"success" | "idle">("idle");
    const [saved, setSaved] = useState(false);

    const handleTestConnection = () => {
        setTestingConnection(true);
        setConnectionResult("idle");
        setTimeout(() => {
            setTestingConnection(false);
            setConnectionResult("success");
        }, 1500);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">GitLab Integration</h2>
                <p className="text-sm text-muted-foreground">Configure connection to your GitLab instance for project generation</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                Connection Settings
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">GitLab instance URL and authentication</CardDescription>
                        </div>
                        <Badge variant="default" className="bg-green-600 hover:bg-green-600 text-white text-[10px]">
                            Connected
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Instance URL</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://gitlab.example.com" className="h-9 pl-9 font-mono text-sm" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">API Token</Label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)} placeholder="glpat-xxxxxxxxxx" className="h-9 pl-9 font-mono text-sm" />
                        </div>
                        <p className="text-[11px] text-muted-foreground">Personal access token with API scope</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Default Namespace</Label>
                        <div className="relative">
                            <FolderGit2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input value={namespace} onChange={(e) => setNamespace(e.target.value)} placeholder="my-organization" className="h-9 pl-9 font-mono text-sm" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Plug className="h-4 w-4" /> Connection Test
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
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
                                    <span className="text-muted-foreground">Test connection before saving</span>
                                )}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleTestConnection} disabled={testingConnection}>
                            {testingConnection ? "Testing..." : "Test Connection"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Generated Features</CardTitle>
                    <CardDescription className="text-xs">What gets created in GitLab when you generate a project</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {["Projects", "Wiki Pages", "Issues", "Labels", "Milestones"].map((feat) => (
                            <span key={feat} className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 text-xs">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {feat}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                {saved ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <Check className="h-4 w-4" /> Configuration saved
                    </span>
                ) : (
                    <Button size="sm" onClick={handleSave}>Save Configuration</Button>
                )}
            </div>
        </div>
    );
}
