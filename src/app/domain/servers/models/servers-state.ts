import { ServerWithMetrics } from "./server-info";

export interface ServersState {
    servers: ServerWithMetrics[];
    loading: boolean;
    error: string | undefined;
}