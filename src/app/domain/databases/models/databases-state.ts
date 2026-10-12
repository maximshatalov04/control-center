import { DatabaseWithMetrics } from "./database-info";

export interface DatabasesState {
    databases: DatabaseWithMetrics[];
    loading: boolean;
    error: string | undefined;
}