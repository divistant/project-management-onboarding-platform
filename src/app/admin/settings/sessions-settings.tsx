"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Trash2 } from "lucide-react";

interface Session {
    id: string;
    browser: string;
    ip: string;
    lastActive: string;
    loggedIn: string;
    isCurrent: boolean;
}

const MOCK_SESSIONS: Session[] = [
    {
        id: "s1",
        browser: "Unknown browser on",
        ip: "127.0.0.1",
        lastActive: "Just now",
        loggedIn: new Date().toLocaleString(),
        isCurrent: true,
    },
    {
        id: "s2",
        browser: "Unknown browser on",
        ip: "127.0.0.1",
        lastActive: "2 hours ago",
        loggedIn: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        isCurrent: false,
    },
    {
        id: "s3",
        browser: "Unknown browser on",
        ip: "127.0.0.1",
        lastActive: "19 hours ago",
        loggedIn: new Date(Date.now() - 19 * 60 * 60 * 1000).toLocaleString(),
        isCurrent: false,
    },
    {
        id: "s4",
        browser: "Unknown browser on",
        ip: "192.168.1.42",
        lastActive: "20 hours ago",
        loggedIn: new Date(Date.now() - 20 * 60 * 60 * 1000).toLocaleString(),
        isCurrent: false,
    },
];

export function SessionsSettings() {
    const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);

    const handleLogout = (id: string) => {
        setSessions((s) => s.filter((sess) => sess.id !== id));
    };

    const handleLogoutAll = () => {
        setSessions((s) => s.filter((sess) => sess.isCurrent));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Sessions</h2>
                <p className="text-sm text-muted-foreground">View and manage your active sessions</p>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Active Sessions</h3>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleLogoutAll}>
                    Logout All Other Sessions
                </Button>
            </div>

            <div className="space-y-3">
                {sessions.map((session) => (
                    <Card key={session.id} className="gap-0 py-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                        <Monitor className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {session.browser}
                                            {session.isCurrent && (
                                                <span className="ml-2 text-xs text-green-600 font-normal">(current)</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            IP: {session.ip} &nbsp;&nbsp; Last active: {session.lastActive}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Logged in: {session.loggedIn}
                                        </p>
                                    </div>
                                </div>
                                {!session.isCurrent && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleLogout(session.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {sessions.length === 0 && (
                    <Card className="gap-0 py-0">
                        <CardContent className="py-8 text-center">
                            <p className="text-sm text-muted-foreground">No active sessions</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
