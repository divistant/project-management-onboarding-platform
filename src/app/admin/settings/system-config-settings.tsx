"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Check, Cog, Info } from "lucide-react";

export function SystemConfigSettings() {
    const [appName, setAppName] = useState("AI-DLC");
    const [defaultLanguage, setDefaultLanguage] = useState("id");
    const [defaultTheme, setDefaultTheme] = useState("system");
    const [retentionDays, setRetentionDays] = useState("365");
    const [maxUploadSize, setMaxUploadSize] = useState("50");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">System Config</h2>
                <p className="text-sm text-muted-foreground">General application configuration</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Cog className="h-4 w-4" /> Application
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Application Name</Label>
                        <Input value={appName} onChange={(e) => setAppName(e.target.value)} className="h-9" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Default Language</Label>
                            <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">🇬🇧 English</SelectItem>
                                    <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Default Theme</Label>
                            <Select value={defaultTheme} onValueChange={setDefaultTheme}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Storage & Limits</CardTitle>
                    <CardDescription className="text-xs">Configure data retention and upload limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Data Retention (days)</Label>
                            <Input value={retentionDays} onChange={(e) => setRetentionDays(e.target.value)} className="h-9 font-mono" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Max Upload Size (MB)</Label>
                            <Input value={maxUploadSize} onChange={(e) => setMaxUploadSize(e.target.value)} className="h-9 font-mono" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" /> System Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[
                            { label: "Version", value: "0.1.0" },
                            { label: "Environment", value: "Development" },
                            { label: "Next.js", value: "16.1.6" },
                            { label: "React", value: "19.2.3" },
                            { label: "Node.js", value: process.version || "v22.x" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                                <Badge variant="outline" className="text-[10px] font-mono">{item.value}</Badge>
                            </div>
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
