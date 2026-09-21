import { EntityType } from "./entity-type";

export interface Entity {
    id: string;
    name: string;
    type: EntityType;
}