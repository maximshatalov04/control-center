import { DatabaseStatus } from "../../../shared/models/database-status";

export interface DatabaseInfo {
    id: string;
    serverId: string;
    name: string;
    dbType: string;
    version: string;
    connectionString: string;
    encoding: string;
    description: string;
    archiveIds: string[];
}

export interface DatabaseMetrics {
    databaseId: string;
    status: DatabaseStatus;
    sizeBytes: number;
    logSizeBytes: number;
    lastBackupAt: string | null;
}

export interface DatabaseWithMetrics extends DatabaseInfo {
    metrics?: Omit<DatabaseMetrics, 'databaseId'>
}