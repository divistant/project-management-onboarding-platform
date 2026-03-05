"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Check, Plus, Copy, Trash2, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    permission: "read" | "write" | "admin";
    createdAt: string;
    lastUsed: string | null;
    expiresAt: string | null;
}

const INITIAL_KEYS: ApiKey[] = [
    {
        id: "key-1",
        name: "CI/CD Pipeline",
        prefix: "aidlc_sk_prod_",
        permission: "write",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "key-2",
        name: "Monitoring Dashboard",
        prefix: "aidlc_sk_mon_",
        permission: "read",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: null,
    },
];

const PERMISSION_COLORS: Record<string, string> = {
    read: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    write: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    admin: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

export function ApiKeysSettings() {
    const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPermission, setNewPermission] = useState<"read" | "write" | "admin">("read");
    const [newExpiry, setNewExpiry] = useState("90");
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [showKey, setShowKey] = useState(false);

    const handleCreate = () => {
        const key = `aidlc_sk_${Math.random().toString(36).slice(2, 10)}_${Math.random().toString(36).slice(2, 18)}`;
        const expiresAt = newExpiry === "never" ? null : new Date(Date.now() + parseInt(newExpiry) * 24 * 60 * 60 * 1000).toISOString();
        const newKey: ApiKey = {
            id: `key-${Date.now()}`,
            name: newName || "Untitled Key",
            prefix: key.slice(0, 14) + "_",
            permission: newPermission,
            createdAt: new Date().toISOString(),
            lastUsed: null,
            expiresAt,
        };
        setKeys((k) => [...k, newKey]);
        setGeneratedKey(key);
    };

    const handleCloseDialog = () => {
        setCreateOpen(false);
        setGeneratedKey(null);
        setNewName("");
        setNewPermission("read");
        setNewExpiry("90");
        setShowKey(false);
    };

    const handleDelete = (id: string) => {
        setKeys((k) => k.filter((key) => key.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold">API Keys</h2>
                    <p className="text-sm text-muted-foreground">Manage API keys for programmatic access</p>
                </div>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Create Key
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <div>
                            <CardTitle className="text-sm">Security Notice</CardTitle>
                            <CardDescription className="text-xs">API keys grant access to your account. Keep them secret and rotate regularly.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {keys.length === 0 ? (
                <Card className="gap-0 py-0">
                    <CardContent className="py-12 text-center">
                        <KeyRound className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium">No API keys</p>
                        <p className="text-xs text-muted-foreground mt-1">Create an API key to get started</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {keys.map((key) => (
                        <Card key={key.id} className="gap-0 py-0">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium">{key.name}</p>
                                                <Badge className={`text-[9px] border-0 ${PERMISSION_COLORS[key.permission]}`}>
                                                    {key.permission}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[11px] font-mono text-muted-foreground">{key.prefix}••••••••</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    Created {timeAgo(key.createdAt)}
                                                </span>
                                                {key.lastUsed && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Last used {timeAgo(key.lastUsed)}
                                                    </span>
                                                )}
                                                {key.expiresAt && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Expires {new Date(key.expiresAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(key.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); else setCreateOpen(true); }}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5" />
                            {generatedKey ? "API Key Created" : "Create API Key"}
                        </DialogTitle>
                        <DialogDescription>
                            {generatedKey
                                ? "Copy your API key now. You won't be able to see it again."
                                : "Create a new API key for programmatic access."}
                        </DialogDescription>
                    </DialogHeader>

                    {generatedKey ? (
                        <div className="space-y-4 py-2">
                            <div className="rounded-lg border bg-muted/30 p-3">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type={showKey ? "text" : "password"}
                                        value={generatedKey}
                                        readOnly
                                        className="h-8 font-mono text-xs border-0 shadow-none bg-transparent p-0 focus-visible:ring-0"
                                    />
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={() => setShowKey(!showKey)}>
                                        {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={() => navigator.clipboard.writeText(generatedKey)}>
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-[11px] text-amber-600 font-medium">⚠ Make sure to copy this key — it will only be shown once.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Key Name</Label>
                                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., CI/CD Pipeline" className="h-9" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Permission</Label>
                                    <Select value={newPermission} onValueChange={(v) => setNewPermission(v as "read" | "write" | "admin")}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="read">Read only</SelectItem>
                                            <SelectItem value="write">Read & Write</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Expires in</Label>
                                    <Select value={newExpiry} onValueChange={setNewExpiry}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 days</SelectItem>
                                            <SelectItem value="90">90 days</SelectItem>
                                            <SelectItem value="365">1 year</SelectItem>
                                            <SelectItem value="never">Never</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {generatedKey ? (
                            <Button size="sm" onClick={handleCloseDialog}>
                                <Check className="mr-1 h-3.5 w-3.5" /> Done
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={handleCloseDialog}>Cancel</Button>
                                <Button size="sm" onClick={handleCreate}>Create Key</Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
