import { Server } from "../../../shared/models/server";

export interface ServersTreeState {
    servers: Server[];
    loading: boolean;
    error: string | undefined;
}