import { ServerStatus } from "../../../shared/models/server-status";
import { DatabaseInfo } from "../../databases/models/database-info";

export interface ServerInfo {
    id: string;
    name: string;
    ipAddress: string;
    port: number;
    softwareVersion: string;
    os: string;
    lastStartAt: Date | string;
    description?: string;
    status: ServerStatus;
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    diskUsagePercent: number;
    databases?: DatabaseInfo[];
}