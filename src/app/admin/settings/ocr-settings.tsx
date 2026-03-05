"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Check, ScanText, Languages, FileImage } from "lucide-react";

const OCR_ENGINES = [
    { id: "tesseract", name: "Tesseract", description: "Open-source, good for clean documents", badge: "Free" },
    { id: "google-vision", name: "Google Vision AI", description: "High accuracy, supports handwriting", badge: "Premium" },
    { id: "azure-di", name: "Azure Document Intelligence", description: "Best for structured documents", badge: "Premium" },
];

const OCR_LANGUAGES = [
    { id: "eng", name: "English" },
    { id: "ind", name: "Indonesian (Bahasa)" },
    { id: "eng+ind", name: "English + Indonesian" },
    { id: "jpn", name: "Japanese" },
    { id: "zho", name: "Chinese" },
];

export function OcrSettings() {
    const [ocrEnabled, setOcrEnabled] = useState(true);
    const [engine, setEngine] = useState("tesseract");
    const [language, setLanguage] = useState("eng+ind");
    const [autoDetect, setAutoDetect] = useState(true);
    const [preprocessEnabled, setPreprocessEnabled] = useState(true);
    const [saved, setSaved] = useState(false);

    const selectedEngine = OCR_ENGINES.find((e) => e.id === engine)!;

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">OCR Settings</h2>
                <p className="text-sm text-muted-foreground">Configure optical character recognition for scanned documents</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <ScanText className="h-4 w-4" /> OCR Processing
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="text-sm font-medium">Enable OCR</p>
                            <p className="text-xs text-muted-foreground">Automatically process scanned PDFs and images</p>
                        </div>
                        <Switch checked={ocrEnabled} onCheckedChange={setOcrEnabled} />
                    </div>
                </CardContent>
            </Card>

            {ocrEnabled && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileImage className="h-4 w-4" /> Engine
                            </CardTitle>
                            <CardDescription className="text-xs">Select the OCR engine for text extraction</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {OCR_ENGINES.map((eng) => (
                                <button
                                    key={eng.id}
                                    onClick={() => setEngine(eng.id)}
                                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${engine === eng.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                        }`}
                                >
                                    <div className={`h-3 w-3 rounded-full border-2 ${engine === eng.id ? "border-primary bg-primary" : "border-muted-foreground/30"}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{eng.name}</span>
                                            <Badge variant="secondary" className="text-[9px] px-1 py-0">{eng.badge}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{eng.description}</p>
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Languages className="h-4 w-4" /> Language & Processing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Document Language</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OCR_LANGUAGES.map((l) => (
                                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="text-sm font-medium">Auto-detect language</p>
                                    <p className="text-xs text-muted-foreground">Automatically detect document language</p>
                                </div>
                                <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <p className="text-sm font-medium">Image preprocessing</p>
                                    <p className="text-xs text-muted-foreground">Deskew, denoise, and enhance before OCR</p>
                                </div>
                                <Switch checked={preprocessEnabled} onCheckedChange={setPreprocessEnabled} />
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            <div className="flex justify-end">
                {saved ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <Check className="h-4 w-4" /> OCR settings saved
                    </span>
                ) : (
                    <Button size="sm" onClick={handleSave}>Save Settings</Button>
                )}
            </div>
        </div>
    );
}
