import { Entity } from "./entity";
import { FileArchive } from "./file-archive";

export interface Database extends Entity {
    type: 'database';
    archives: FileArchive[];
}