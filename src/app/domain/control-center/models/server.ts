import { Database } from "./database";
import { Entity } from "./entity";

export interface Server extends Entity {
    type: 'server';
    databases: Database[];
}