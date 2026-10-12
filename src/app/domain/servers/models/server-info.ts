import { ServerStatus } from "../../../shared/models/server-status";

export interface ServerInfo {
    id: string;
    name: string;
    ipAddress: string;
    port: number;
    softwareVersion: string;
    os: string;
    description: string;
    databaseIds: string[];
}

export interface ServerMetrics {
    serverId: string;
    status: ServerStatus;
    lastStartAt: string | null;
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    diskUsagePercent: number;
}

export interface ServerWithMetrics extends ServerInfo {
    metrics?: Omit<ServerMetrics, 'serverId'>
}