import { FileArchiveStatus } from "../../../shared/models/file-archive-status";

export interface FileArchiveInfo {
    id: string;
    name: string;
    path: string;
    maxCapacityBytes: number;
    usedBytes: number;
    fileCount: number;
    status: FileArchiveStatus;
    lastModifiedAt: Date | string | null;
    retentionPolicy: string;
    description?: string;
}