"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Check, FolderKanban, Clock, CalendarDays, Building2, Mail } from "lucide-react";
import { SEED_ONBOARDING } from "@/mocks/seed-data";
import { ROLE_LABELS } from "@/lib/constants";
import type { User, UserRole, UserStatus } from "@/types/onboarding";

interface UserDetailDrawerProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: (user: User) => void;
}

function timeAgo(date: string | null): string {
    if (!date) return "Never";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

const STATUS_STYLES: Record<UserStatus, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    invited: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

export function UserDetailDrawer({ user, open, onOpenChange, onUpdate }: UserDetailDrawerProps) {
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRole, setEditRole] = useState<UserRole>("pm");
    const [editDept, setEditDept] = useState("");
    const [editStatus, setEditStatus] = useState<UserStatus>("active");
    const [saved, setSaved] = useState(false);

    // Sync state when user changes
    const syncUser = (u: User) => {
        setEditName(u.name);
        setEditEmail(u.email);
        setEditRole(u.role);
        setEditDept(u.department);
        setEditStatus(u.status);
    };

    // Track previous user to detect changes
    const [prevUserId, setPrevUserId] = useState<string | null>(null);
    if (user && user.id !== prevUserId) {
        setPrevUserId(user.id);
        syncUser(user);
    }

    if (!user) return null;

    const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    // Find assigned projects
    const assignedProjects = SEED_ONBOARDING.filter(
        (p) => p.ownerId === user.id || p.compliance?.approvals.some((a) => a.userId === user.id) || p.reviewers?.some((r) => r.userId === user.id)
    );

    // Activity from audit log
    const recentActivity = SEED_ONBOARDING.flatMap((p) =>
        p.auditLog.filter((a) => a.userId === user.id).map((a) => ({ ...a, projectName: p.name }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

    const handleSave = () => {
        onUpdate({
            ...user,
            name: editName,
            email: editEmail,
            role: editRole,
            department: editDept,
            status: editStatus,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto">
                <SheetHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-base font-semibold bg-primary/10 text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <SheetTitle className="text-base">{user.name}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2 text-xs">
                                <Mail className="h-3 w-3" /> {user.email}
                            </SheetDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-[10px] border-0 ${STATUS_STYLES[user.status]}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{ROLE_LABELS[user.role]}</Badge>
                        <Badge variant="outline" className="text-[10px]">{user.department}</Badge>
                    </div>
                </SheetHeader>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-lg border p-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                            <Clock className="h-3 w-3" /> Last Login
                        </div>
                        <p className="text-xs font-medium">{timeAgo(user.lastLogin)}</p>
                    </div>
                    <div className="rounded-lg border p-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                            <CalendarDays className="h-3 w-3" /> Joined
                        </div>
                        <p className="text-xs font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Edit form */}
                <div className="space-y-4 mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Edit User</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-[11px]">Name</Label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[11px]">Email</Label>
                            <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-8 text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-[11px]">Role</Label>
                            <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pm">PM</SelectItem>
                                    <SelectItem value="compliance">Compliance</SelectItem>
                                    <SelectItem value="tech_lead">Tech Lead</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[11px]">Department</Label>
                            <Input value={editDept} onChange={(e) => setEditDept(e.target.value)} className="h-8 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[11px]">Status</Label>
                            <Select value={editStatus} onValueChange={(v) => setEditStatus(v as UserStatus)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="invited">Invited</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        {saved ? (
                            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                <Check className="h-3.5 w-3.5" /> Saved
                            </span>
                        ) : (
                            <Button size="sm" className="h-7 text-xs" onClick={handleSave}>Save</Button>
                        )}
                    </div>
                </div>

                {/* Assigned Projects */}
                <div className="mb-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <FolderKanban className="h-3.5 w-3.5" /> Assigned Projects ({assignedProjects.length})
                    </h4>
                    {assignedProjects.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-3">No projects assigned</p>
                    ) : (
                        <div className="space-y-1.5">
                            {assignedProjects.map((p) => (
                                <div key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <div>
                                        <p className="text-xs font-medium">{p.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{p.org}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[9px]">{p.status}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Activity */}
                <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Recent Activity
                    </h4>
                    {recentActivity.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-3">No recent activity</p>
                    ) : (
                        <div className="space-y-1">
                            {recentActivity.map((a) => (
                                <div key={a.id} className="rounded-md border px-3 py-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-medium">{a.detail}</p>
                                        <span className="text-[9px] text-muted-foreground shrink-0 ml-2">{timeAgo(a.timestamp)}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{a.projectName}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
