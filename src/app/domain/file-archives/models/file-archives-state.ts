import { FileArchiveWithMetrics } from "./file-archive-info";

export interface FileArchivesState {
    archives: FileArchiveWithMetrics[];
    loading: boolean;
    error: string | undefined;
}