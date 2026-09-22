import { EntityType } from "./entity-type";

export interface Entity<T extends EntityType = EntityType> {
    id: string;
    name: string;
    type: T; // Теперь тип выводится автоматически из параметра дженерика
}