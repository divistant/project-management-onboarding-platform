"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { Check, Camera } from "lucide-react";

export function ProfileSettings() {
    const { currentUser } = useAuthStore();
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState(currentUser.email);
    const [saved, setSaved] = useState(false);

    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Profile</h2>
                <p className="text-sm text-muted-foreground">Manage your personal information</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Avatar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground">{email}</p>
                            <Badge variant="secondary" className="mt-1 text-[10px]">{currentUser.role}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Personal Information</CardTitle>
                    <CardDescription className="text-xs">Update your name and email address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Full Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Email</Label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Role</Label>
                        <Input value={currentUser.role} disabled className="h-9 bg-muted" />
                        <p className="text-[11px] text-muted-foreground">Role can only be changed by an administrator</p>
                    </div>
                    <div className="flex justify-end">
                        {saved ? (
                            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                <Check className="h-4 w-4" /> Saved
                            </span>
                        ) : (
                            <Button size="sm" onClick={handleSave}>Save Changes</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
