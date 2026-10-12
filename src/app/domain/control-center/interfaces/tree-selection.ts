import { Entity } from "../../../shared/models/entity";

// То, что эмитит tree-view при клике
export interface TreeSelection {
    entity: Entity;
    // Путь родителей — пустой для сервера, [serverId] для БД, [serverId, databaseId] для архива
    parentIds: string[];
}

export function treeSelection(
    entity: Entity,
    parentIds: string[] = []
): TreeSelection {
    return { entity, parentIds };
}