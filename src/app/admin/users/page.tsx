"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Users,
    UserCheck,
    UserPlus,
    Mail,
    Search,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    Trash2,
    ShieldCheck,
    Ban,
    ArrowUpDown,
    Building2,
} from "lucide-react";
import { USERS } from "@/mocks/seed-data";
import { ROLE_LABELS } from "@/lib/constants";
import { InviteUserDialog } from "./invite-user-dialog";
import { UserDetailDrawer } from "./user-detail-drawer";
import type { User, UserRole, UserStatus } from "@/types/onboarding";

type SortField = "name" | "role" | "lastLogin" | "createdAt";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<UserStatus, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    invited: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

const ROLE_STYLES: Record<UserRole, string> = {
    pm: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    compliance: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    tech_lead: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    admin: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

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

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(USERS);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [inviteOpen, setInviteOpen] = useState(false);
    const [detailUser, setDetailUser] = useState<User | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Filter & sort
    const filteredUsers = useMemo(() => {
        let result = users;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
            );
        }

        if (roleFilter !== "all") {
            result = result.filter((u) => u.role === roleFilter);
        }

        if (statusFilter !== "all") {
            result = result.filter((u) => u.status === statusFilter);
        }

        result = [...result].sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case "name": cmp = a.name.localeCompare(b.name); break;
                case "role": cmp = a.role.localeCompare(b.role); break;
                case "lastLogin": {
                    const aT = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
                    const bT = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
                    cmp = aT - bT;
                    break;
                }
                case "createdAt": cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return result;
    }, [users, search, roleFilter, statusFilter, sortField, sortDir]);

    // Counts
    const totalCount = users.length;
    const activeCount = users.filter((u) => u.status === "active").length;
    const invitedCount = users.filter((u) => u.status === "invited").length;

    // Role distribution
    const roleDistribution = useMemo(() => {
        const counts: Record<UserRole, number> = { pm: 0, compliance: 0, tech_lead: 0, admin: 0 };
        users.forEach((u) => counts[u.role]++);
        return counts;
    }, [users]);

    // Selection handlers
    const toggleSelected = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredUsers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
        }
    };

    // Sort handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />;
        return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
    };

    // Bulk actions
    const handleBulkDeactivate = () => {
        setUsers((u) => u.map((user) => selectedIds.has(user.id) ? { ...user, status: "inactive" as UserStatus } : user));
        setSelectedIds(new Set());
    };

    const handleBulkDelete = () => {
        setUsers((u) => u.filter((user) => !selectedIds.has(user.id)));
        setSelectedIds(new Set());
    };

    // Invite
    const handleInvite = (user: User) => {
        setUsers((u) => [...u, user]);
    };

    // Update user from drawer
    const handleUpdateUser = (updated: User) => {
        setUsers((u) => u.map((user) => (user.id === updated.id ? updated : user)));
        setDetailUser(updated);
    };

    // Open drawer
    const openDetail = (user: User) => {
        setDetailUser(user);
        setDrawerOpen(true);
    };

    const maxRole = Math.max(...Object.values(roleDistribution));

    return (
        <AppLayout>
            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Manage users, roles, and access permissions
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-3">
                    <Card className="gap-0 py-0">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Users className="h-3.5 w-3.5" /> Total Users
                            </div>
                            <p className="text-2xl font-bold">{totalCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="gap-0 py-0">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <UserCheck className="h-3.5 w-3.5" /> Active
                            </div>
                            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="gap-0 py-0">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Mail className="h-3.5 w-3.5" /> Pending Invites
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{invitedCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="gap-0 py-0">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Building2 className="h-3.5 w-3.5" /> By Role
                            </div>
                            <div className="space-y-1">
                                {(Object.entries(roleDistribution) as [UserRole, number][]).map(([role, count]) => (
                                    <div key={role} className="flex items-center gap-2">
                                        <span className="text-[9px] w-10 text-muted-foreground truncate">{ROLE_LABELS[role].split(" ")[0]}</span>
                                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${role === "pm" ? "bg-violet-500" : role === "compliance" ? "bg-amber-500" : role === "tech_lead" ? "bg-cyan-500" : "bg-red-500"
                                                    }`}
                                                style={{ width: `${maxRole > 0 ? (count / maxRole) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium w-3 text-right">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="h-9 pl-9 text-sm"
                        />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="h-9 w-36 text-xs">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="pm">Project Manager</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="tech_lead">Tech Lead</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-32 text-xs">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="invited">Invited</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="ml-auto">
                        <Button size="sm" onClick={() => setInviteOpen(true)}>
                            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Invite User
                        </Button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5">
                        <span className="text-xs font-medium">{selectedIds.size} selected</span>
                        <div className="h-4 w-px bg-border" />
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleBulkDeactivate}>
                            <Ban className="mr-1 h-3 w-3" /> Deactivate
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleBulkDelete}>
                            <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>
                            Clear
                        </Button>
                    </div>
                )}

                {/* Table */}
                <Card className="gap-0 py-0">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="px-4 py-3 w-10">
                                            <Checkbox
                                                checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0}
                                                onCheckedChange={toggleAll}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => handleSort("name")}>
                                                User <SortIcon field="name" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => handleSort("role")}>
                                                Role <SortIcon field="role" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <span className="text-xs font-medium text-muted-foreground">Department</span>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <span className="text-xs font-medium text-muted-foreground">Status</span>
                                        </th>
                                        <th className="px-4 py-3 text-left">
                                            <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => handleSort("lastLogin")}>
                                                Last Login <SortIcon field="lastLogin" />
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => {
                                        const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                                        return (
                                            <tr
                                                key={user.id}
                                                className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => openDetail(user)}
                                            >
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedIds.has(user.id)}
                                                        onCheckedChange={() => toggleSelected(user.id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                                                                {initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">{user.name}</p>
                                                            <p className="text-[11px] text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge className={`text-[10px] border-0 ${ROLE_STYLES[user.role]}`}>
                                                        {ROLE_LABELS[user.role]}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-muted-foreground">{user.department}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge className={`text-[10px] border-0 ${STATUS_STYLES[user.status]}`}>
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-muted-foreground">{timeAgo(user.lastLogin)}</span>
                                                </td>
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openDetail(user)}>
                                                                <ShieldCheck className="mr-2 h-3.5 w-3.5" /> View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    const newStatus = user.status === "active" ? "inactive" : "active";
                                                                    setUsers((u) => u.map((usr) => usr.id === user.id ? { ...usr, status: newStatus as UserStatus } : usr));
                                                                }}
                                                            >
                                                                <Ban className="mr-2 h-3.5 w-3.5" />
                                                                {user.status === "active" ? "Deactivate" : "Activate"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => setUsers((u) => u.filter((usr) => usr.id !== user.id))}
                                                            >
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredUsers.length === 0 && (
                                <div className="py-12 text-center">
                                    <Users className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
                                    <p className="text-sm font-medium">No users found</p>
                                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                Showing {filteredUsers.length} of {totalCount} users
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />
            <UserDetailDrawer user={detailUser} open={drawerOpen} onOpenChange={setDrawerOpen} onUpdate={handleUpdateUser} />
        </AppLayout>
    );
}
