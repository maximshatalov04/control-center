import { Database } from "./database";
import { Entity } from "./entity";

export interface Server extends Entity<'server'> {
    databases: Database[];
}