"use client";

import { useState } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Check, Send } from "lucide-react";
import type { User, UserRole } from "@/types/onboarding";

interface InviteUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvite: (user: User) => void;
}

const DEPARTMENTS = ["Engineering", "Product", "Quality Assurance", "Legal & Compliance", "IT Operations", "Design", "Finance"];

export function InviteUserDialog({ open, onOpenChange, onInvite }: InviteUserDialogProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>("pm");
    const [department, setDepartment] = useState("Engineering");
    const [sent, setSent] = useState(false);

    const handleInvite = () => {
        const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            role,
            avatar: initials,
            status: "invited",
            department,
            lastLogin: null,
            createdAt: new Date().toISOString(),
            invitedBy: "user-4",
        };

        onInvite(newUser);
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setName("");
            setEmail("");
            setRole("pm");
            setDepartment("Engineering");
            onOpenChange(false);
        }, 1500);
    };

    const isValid = name.trim().length > 0 && email.trim().length > 0 && email.includes("@");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Invite User
                    </DialogTitle>
                    <DialogDescription>
                        Send an invitation to a new team member.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Full Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Andi Pratama" className="h-9" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Email</Label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="andi@company.com" className="h-9" type="email" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Role</Label>
                            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pm">Project Manager</SelectItem>
                                    <SelectItem value="compliance">Compliance Officer</SelectItem>
                                    <SelectItem value="tech_lead">Tech Lead</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Department</Label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENTS.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    {sent ? (
                        <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                            <Check className="h-4 w-4" /> Invitation sent!
                        </span>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleInvite} disabled={!isValid}>
                                <Send className="mr-1.5 h-3.5 w-3.5" /> Send Invitation
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
