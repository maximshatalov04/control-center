import { DatabaseStatus } from "../../../shared/models/database-status";
import { FileArchiveInfo } from "../../file-archives/models/file-archive-info";

export interface DatabaseInfo {
    id: string;
    name: string;
    dbType: string;
    version: string;
    connectionString: string;
    encoding: string;
    sizeBytes: number;
    logSizeBytes: number;
    status: DatabaseStatus;
    lastBackupAt: Date | string | null;
    description?: string;
    archives?: FileArchiveInfo[];
}