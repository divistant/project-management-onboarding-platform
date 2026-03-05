"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Area
} from "recharts";
import {
    volumeTrendData,
    pipelineFunnelData,
    orgDistributionData,
    aiSuccessRateData
} from "@/mocks/analytics-data";
import { Download, Calendar, ArrowUpRight, ArrowDownRight, Activity, Clock, Zap, Target } from "lucide-react";
import { useT } from "@/lib/i18n/use-translation";
import { useI18nStore } from "@/lib/i18n";
import { useState } from "react";

export default function AnalyticsPage() {
    const t = useT();
    const [timeRange, setTimeRange] = useState("30d");

    // Format tooltip nicely
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-muted-foreground">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span>{entry.name}:</span>
                            <span className="font-medium text-foreground">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Analytics & Insights</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Platform usage, pipeline velocity, and AI performance metrics
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px] h-9">
                                <Calendar className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Select Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="90d">Last 90 Days</SelectItem>
                                <SelectItem value="1y">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="h-9">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Headline KPIs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="gap-0 py-0 overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Velocity</p>
                                    <p className="text-2xl font-bold leading-none mt-1">3.2 <span className="text-sm font-medium text-muted-foreground">Days</span></p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-xs">
                                <span className="flex items-center text-green-600 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded font-medium">
                                    <ArrowDownRight className="h-3 w-3 mr-0.5" /> 12%
                                </span>
                                <span className="text-muted-foreground">from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0 overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/40">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion Rate</p>
                                    <p className="text-2xl font-bold leading-none mt-1">94.5<span className="text-sm font-medium text-muted-foreground">%</span></p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-xs">
                                <span className="flex items-center text-green-600 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded font-medium">
                                    <ArrowUpRight className="h-3 w-3 mr-0.5" /> 2.4%
                                </span>
                                <span className="text-muted-foreground">from last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0 overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/40">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Workspaces</p>
                                    <p className="text-2xl font-bold leading-none mt-1">112</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-xs">
                                <span className="flex items-center text-green-600 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded font-medium">
                                    <ArrowUpRight className="h-3 w-3 mr-0.5" /> 18
                                </span>
                                <span className="text-muted-foreground">new this week</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0 overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40">
                                    <Target className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Org Request</p>
                                    <p className="text-xl font-bold leading-none mt-1 truncate max-w-[120px]">Core Banking</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-xs">
                                <span className="flex items-center text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                                    45 Projects
                                </span>
                                <span className="text-muted-foreground">this quarter</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Main Trend Line Chart */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Request Volume Trend</CardTitle>
                            <CardDescription>Onboarding projects initiated vs completed</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={volumeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                        <Area type="monotone" dataKey="projects" name="Initiated" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorProjects)" />
                                        <Line type="monotone" dataKey="completed" name="Completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Success Stacked Bar */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">AI Pipeline Success Rate</CardTitle>
                            <CardDescription>Extraction & enrichment pass vs fail</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={aiSuccessRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                        <Bar dataKey="success" name="Success (Auto)" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} maxBarSize={32} />
                                        <Bar dataKey="failed" name="Intervention Needed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Funnel Chart */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Pipeline Stage Distribution</CardTitle>
                            <CardDescription>Current project count at each stage</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={pipelineFunnelData} margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                                        <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: 500 }} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                                        <Bar dataKey="count" name="Projects" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                            {pipelineFunnelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Org Distribution Donut */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Distribution by Organization</CardTitle>
                            <CardDescription>Request origins based on department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={orgDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {orgDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            verticalAlign="middle"
                                            align="right"
                                            layout="vertical"
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center text for donut */}
                                <div className="absolute top-1/2 left-[calc(50%-55px)] -translate-x-1/2 -translate-y-[55%] text-center pointer-events-none">
                                    <p className="text-2xl font-bold leading-none text-foreground">100<span className="text-sm">%</span></p>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">Total</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
