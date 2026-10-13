import { Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { Server } from '../../../../shared/models/server';
import { TreeSelection, treeSelection } from '../../interfaces/tree-selection';
import { Database } from '../../../../shared/models/database';
import { FileArchive } from '../../../../shared/models/file-archive';
import { ServersTreeStateService } from '../../api/servers-tree-state';
import { take } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-tree-view',
  styleUrl: './tree-view.component.scss',
  templateUrl: './tree-view.component.html',
})
export class TreeViewComponent implements OnInit {
  readonly #state = inject(ServersTreeStateService);
  readonly selectedObject = output<TreeSelection>();
  readonly selectedId = signal<string>("");

  readonly serversExpanded = signal<boolean>(true);
  readonly expandedStates = signal<Record<string, boolean>>({});
  readonly servers = computed(() => this.#state.servers());

  toggleNode(key: string) {
    this.expandedStates.update(states => ({
      ...states,
      [key]: !states[key] // Создаем новый объект (иммутабельность)
    }));
    if (key === 'servers') {
      const serversExpanded = this.serversExpanded();
      this.serversExpanded.set(!serversExpanded);
    }
  }

  getDbExpanded(serverId: string): boolean {
    // Читаем значение из сигнала с вызовом скобок ()
    return this.expandedStates()['db-' + serverId] ?? false;
  }

  getArchExpanded(dbId: string): boolean {
    // Читаем значение из сигнала с вызовом скобок ()
    return this.expandedStates()['arch-' + dbId] ?? false;
  }

  // Сервер — родительских ID нет
  onServerSelection(server: Server) {
    this.selectedId.set(server.id);
    this.selectedObject.emit(treeSelection(server));
  }

  // База данных — родитель это server.id
  onDatabaseSelection(server: Server, db: Database) {
    this.selectedId.set(db.id);
    this.selectedObject.emit(treeSelection(db, [server.id]));
  }

  // Архив — родитель это server.id и db.id
  onArchiveSelection(server: Server, db: Database, archive: FileArchive) {
    this.selectedId.set(archive.id);
    this.selectedObject.emit(treeSelection(archive, [server.id, db.id]));
  }

  ngOnInit(): void {
    this.#state.loadAll().pipe(take(1))
      .subscribe();
  };
}