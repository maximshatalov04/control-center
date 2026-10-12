import { FileArchiveStatus } from "../../../shared/models/file-archive-status";

export interface FileArchiveInfo {
    id: string;
    databaseId: string;
    name: string;
    path: string;
    maxCapacityBytes: number;
    retentionPolicy: string;
    description: string;
}

export interface FileArchiveMetrics {
    fileArchiveId: string;
    status: FileArchiveStatus;
    usedBytes: number;
    fileCount: number;
    lastModifiedAt: string | null;
}

export interface FileArchiveWithMetrics extends FileArchiveInfo {
    metrics?: Omit<FileArchiveMetrics, 'fileArchiveId'>
}