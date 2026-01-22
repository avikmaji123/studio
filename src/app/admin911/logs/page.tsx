
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { summarizeSystemStatus, type SummarizeSystemStatusOutput } from '@/ai/flows/summarize-system-status';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { LogEntry } from '@/lib/types';

function getBadgeVariant(level: LogEntry['severity']) {
    switch (level) {
        case 'critical': return 'destructive';
        case 'warning': return 'secondary';
        case 'info': return 'default';
        default: return 'outline';
    }
}

function StatusCard({ logs, isLoading }: { logs: LogEntry[] | null, isLoading: boolean }) {
    const [analysis, setAnalysis] = useState<SummarizeSystemStatusOutput | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(true);

    useEffect(() => {
        if (isLoading || !logs) {
            return;
        }
        
        const runAnalysis = async () => {
            setIsAnalysisLoading(true);
            try {
                const recentLogs = logs.slice(0, 20);
                const serializableLogs = recentLogs.map(log => ({
                    ...log,
                    timestamp: log.timestamp.toDate().toISOString(),
                }));
                const result = await summarizeSystemStatus({ logs: serializableLogs });
                setAnalysis(result);
            } catch (error) {
                console.error("Log analysis failed:", error);
                setAnalysis({
                    status: 'Critical Alert',
                    explanation: 'The AI log analysis service failed to respond.',
                    action: 'Check the AI service logs and ensure it is running correctly.'
                });
            } finally {
                setIsAnalysisLoading(false);
            }
        };

        runAnalysis();
    }, [logs, isLoading]);

    if (isAnalysisLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
            </Card>
        )
    }

    if (!analysis) return null;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                <p className="text-lg font-semibold">{analysis.status}</p>
                <p className="text-sm text-muted-foreground">{analysis.explanation}</p>
                {analysis.action && (
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400 pt-2">
                       <span className="font-bold">Suggestion:</span> {analysis.action}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default function AdminLogsPage() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');

    const logsQuery = useMemoFirebase(() => 
        query(collection(firestore, 'logs'), orderBy('timestamp', 'desc'), limit(100)),
        [firestore]
    );

    const { data: logs, isLoading } = useCollection<LogEntry>(logsQuery);

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        return logs
            .filter(log => {
                const severityMatch = severityFilter === 'all' || log.severity === severityFilter;
                const searchMatch = searchTerm.trim() === '' || 
                                    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (log.metadata?.userId && log.metadata.userId.includes(searchTerm)) ||
                                    (log.metadata?.ip && log.metadata.ip.includes(searchTerm));
                return severityMatch && searchMatch;
            });
    }, [logs, searchTerm, severityFilter]);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <h1 className="text-3xl font-bold">System & Audit Logs</h1>
            <p className="text-muted-foreground">
                View critical system events and administrator actions from the live database.
            </p>

            <StatusCard logs={logs} isLoading={isLoading} />

            <Card>
                <CardHeader>
                    <CardTitle>All Logs</CardTitle>
                    <CardDescription>A read-only log of all actions performed by administrators and the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search logs by keyword, user, IP..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Time</TableHead>
                                <TableHead className="w-[100px]">Severity</TableHead>
                                <TableHead className="w-[120px]">Source</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead className="w-[200px]">Metadata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {isLoading && Array.from({length: 5}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                </TableRow>
                           ))}
                           {filteredLogs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {log.timestamp ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true }) : 'now'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getBadgeVariant(log.severity)} className="capitalize">{log.severity}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium capitalize">{log.source}</TableCell>
                                    <TableCell>{log.message}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-mono">
                                        {log.metadata?.userId && <div>User: {log.metadata.userId.substring(0, 8)}...</div>}
                                        {log.metadata?.ip && <div>IP: {log.metadata.ip}</div>}
                                        {log.metadata?.courseId && <div>Course: {log.metadata.courseId}</div>}
                                    </TableCell>
                                </TableRow>
                           ))}
                           {!isLoading && filteredLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No system activity recorded yet.
                                    </TableCell>
                                </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    )
}
