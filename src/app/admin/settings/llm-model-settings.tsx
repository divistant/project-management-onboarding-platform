"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Check,
    Bot,
    Cpu,
    Thermometer,
    DollarSign,
    Settings2,
    RefreshCw,
    Zap,
    RotateCcw,
    Landmark,
} from "lucide-react";

const PROVIDERS = [
    { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4-turbo", "gpt-4o-mini"] },
    { id: "anthropic", name: "Anthropic (Claude)", models: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"] },
    { id: "google", name: "Google (Gemini)", models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"] },
    { id: "ollama", name: "Ollama (Local)", models: ["llama3.2", "mistral", "codellama"] },
];

export function LlmModelSettings() {
    const [provider, setProvider] = useState("anthropic");
    const [modelName, setModelName] = useState("claude-3-5-sonnet-20241022");
    const [baseUrl, setBaseUrl] = useState("http://localhost:11434/v1");
    const [temperature, setTemperature] = useState("0.1");
    const [maxTokens, setMaxTokens] = useState("4096");
    const [timeout, setTimeout_] = useState("90");
    const [maxRetries, setMaxRetries] = useState("3");
    const [canaryPercent, setCanaryPercent] = useState("0");
    const [fallbackProvider, setFallbackProvider] = useState("");
    const [fallbackModel, setFallbackModel] = useState("");
    const [costTracking, setCostTracking] = useState(true);
    const [monthlyBudget, setMonthlyBudget] = useState("500");
    const [alertThreshold, setAlertThreshold] = useState("80");
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<"idle" | "success">("idle");
    const [saved, setSaved] = useState(false);

    const selectedProvider = PROVIDERS.find((p) => p.id === provider)!;
    const alertAmount = (parseFloat(monthlyBudget || "0") * parseFloat(alertThreshold || "0") / 100).toFixed(0);

    const handleProviderChange = (v: string) => {
        setProvider(v);
        const p = PROVIDERS.find((pr) => pr.id === v)!;
        setModelName(p.models[0]);
    };

    const handleTestConnection = () => {
        setTesting(true);
        setTestResult("idle");
        window.setTimeout(() => {
            setTesting(false);
            setTestResult("success");
        }, 1500);
    };

    const handleSave = () => {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">LLM Model</h2>
                <p className="text-sm text-muted-foreground">Configure the LLM provider, model, and inference parameters</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3">
                <Card className="gap-0 py-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Settings2 className="h-3.5 w-3.5" /> Provider
                        </div>
                        <p className="text-lg font-bold">{selectedProvider.name.split(" ")[0]}</p>
                    </CardContent>
                </Card>
                <Card className="gap-0 py-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Bot className="h-3.5 w-3.5" /> Model
                        </div>
                        <p className="text-sm font-bold truncate">{modelName}</p>
                        <p className="text-[10px] text-muted-foreground">Max {maxTokens} tokens</p>
                    </CardContent>
                </Card>
                <Card className="gap-0 py-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Thermometer className="h-3.5 w-3.5" /> Temperature
                        </div>
                        <p className="text-lg font-bold">{temperature}</p>
                        <p className="text-[10px] text-muted-foreground">Creativity level</p>
                    </CardContent>
                </Card>
                <Card className="gap-0 py-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <DollarSign className="h-3.5 w-3.5" /> Budget
                        </div>
                        <p className="text-lg font-bold">${monthlyBudget}/mo</p>
                        <p className="text-[10px] text-muted-foreground">Alert at {alertThreshold}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Provider Configuration */}
            <Card className="gap-0 py-0">
                <CardContent className="p-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        <div>
                            <h3 className="text-sm font-semibold">Provider Configuration</h3>
                            <p className="text-xs text-muted-foreground">Configure the LLM provider, model, and inference parameters.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Provider</Label>
                            <Select value={provider} onValueChange={handleProviderChange}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROVIDERS.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">The LLM provider to use for document analysis.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Model Name</Label>
                            <Input value={modelName} onChange={(e) => setModelName(e.target.value)} className="h-9 font-mono text-sm" />
                            <p className="text-[11px] text-muted-foreground">The specific model identifier for the selected provider.</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Base URL</Label>
                        <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="h-9 font-mono text-sm" />
                        <p className="text-[11px] text-muted-foreground">API endpoint for the LLM provider.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Inference Parameters */}
            <Card className="gap-0 py-0">
                <CardContent className="p-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <h3 className="text-sm font-semibold">Inference Parameters</h3>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Temperature</Label>
                            <Input value={temperature} onChange={(e) => setTemperature(e.target.value)} className="h-9 font-mono" />
                            <p className="text-[11px] text-muted-foreground">Controls randomness (0 = deterministic, 2 = creative).</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Max Tokens</Label>
                            <Input value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} className="h-9 font-mono" />
                            <p className="text-[11px] text-muted-foreground">Maximum tokens in the response output.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Timeout (seconds)</Label>
                            <Input value={timeout} onChange={(e) => setTimeout_(e.target.value)} className="h-9 font-mono" />
                            <p className="text-[11px] text-muted-foreground">Request timeout before retrying or failing.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Max Retries</Label>
                            <Input value={maxRetries} onChange={(e) => setMaxRetries(e.target.value)} className="h-9 font-mono" />
                            <p className="text-[11px] text-muted-foreground">Number of retry attempts on failure.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Canary & Fallback */}
            <Card className="gap-0 py-0">
                <CardContent className="p-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        <div>
                            <h3 className="text-sm font-semibold">Canary & Fallback</h3>
                            <p className="text-xs text-muted-foreground">Configure canary deployments and fallback providers.</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Canary Percent (%)</Label>
                        <Input value={canaryPercent} onChange={(e) => setCanaryPercent(e.target.value)} className="h-9 font-mono" />
                        <p className="text-[11px] text-muted-foreground">Percentage of requests routed to the canary model.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Fallback Provider</Label>
                            <Input value={fallbackProvider} onChange={(e) => setFallbackProvider(e.target.value)} placeholder="e.g., openai" className="h-9 font-mono text-sm" />
                            <p className="text-[11px] text-muted-foreground">Provider to use if the primary LLM is unavailable.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Fallback Model</Label>
                            <Input value={fallbackModel} onChange={(e) => setFallbackModel(e.target.value)} placeholder="e.g., gpt-4o-mini" className="h-9 font-mono text-sm" />
                            <p className="text-[11px] text-muted-foreground">Model to use with the fallback provider.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Budget & Tracking */}
            <Card className="gap-0 py-0">
                <CardContent className="p-6 space-y-5">
                    <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        <div>
                            <h3 className="text-sm font-semibold">Budget & Tracking</h3>
                            <p className="text-xs text-muted-foreground">Monitor and control LLM usage costs.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="cost-tracking"
                            checked={costTracking}
                            onCheckedChange={(checked) => setCostTracking(checked as boolean)}
                        />
                        <div>
                            <label htmlFor="cost-tracking" className="text-sm font-medium cursor-pointer">Enable Cost Tracking</label>
                            <p className="text-xs text-muted-foreground">Track token usage and estimated costs for all LLM calls.</p>
                        </div>
                    </div>

                    {costTracking && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Monthly Budget (USD)</Label>
                                    <Input value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} className="h-9 font-mono" />
                                    <p className="text-[11px] text-muted-foreground">Maximum monthly spend. Set to 0 for unlimited.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Alert Threshold (%)</Label>
                                    <Input value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} className="h-9 font-mono" />
                                    <p className="text-[11px] text-muted-foreground">Send an alert when usage reaches this percentage.</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Alert triggers at: <span className="font-semibold text-foreground">${alertAmount} USD</span>
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Save */}
            <div className="flex justify-end">
                {saved ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <Check className="h-4 w-4" /> Settings saved
                    </span>
                ) : (
                    <Button size="sm" onClick={handleSave}>Save Settings</Button>
                )}
            </div>

            {/* Test Connection */}
            <Card className="gap-0 py-0">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        <div>
                            <h3 className="text-sm font-semibold">Test Connection</h3>
                            <p className="text-xs text-muted-foreground">Verify the LLM provider is reachable.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTestConnection}
                            disabled={testing}
                        >
                            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`} />
                            {testing ? "Testing..." : "Test LLM Connection"}
                        </Button>
                        {testResult === "success" && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <Check className="h-3.5 w-3.5" /> Connection successful
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground">Sends a simple prompt to the configured LLM.</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
