import { Component, computed, output, signal } from '@angular/core';
import { Entity } from '../../models/entity';
import { Server } from '../../models/server';
import { log } from 'node:console';

@Component({
  imports: [],
  selector: 'app-tree-view',
  styleUrl: './tree-view.component.scss',
  templateUrl: './tree-view.component.html',
})
export class TreeViewComponent {
  readonly selectedObject = output<Entity | undefined>();
  readonly selectedId = signal<string>("");

  readonly serversExpanded = signal<boolean>(true);
  readonly expandedStates = signal<Record<string, boolean>>({});

  readonly servers = signal<Server[]>([
    {
      id: 'srv-1',
      name: 'Сервер приложений 1',
      type: 'server',
      databases: [
        {
          id: 'db-1',
          name: 'База данных OLTP',
          type: 'database',
          archives: [
            { id: 'arch-1', name: 'Архив транзакций 2026', type: 'archive' },
            { id: 'arch-2', name: 'Архив логов 2026', type: 'archive' }
          ]
        },
        {
          id: 'db-2',
          name: 'База данных OLAP',
          type: 'database',
          archives: [
            { id: 'arch-3', name: 'Архив отчетов 2026', type: 'archive' }
          ]
        }
      ]
    },
    {
      id: 'srv-2',
      name: 'Сервер приложений 2',
      type: 'server',
      databases: [
        {
          id: 'db-3',
          name: 'База данных CRM',
          type: 'database',
          archives: [
            { id: 'arch-4', name: 'Архив контактов 2026', type: 'archive' },
            { id: 'arch-5', name: 'Архив сделок 2026', type: 'archive' }
          ]
        }
      ]
    }
  ]);

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

  selectObject(entity: Entity) {
    this.selectedId.set(entity.id);
    this.selectedObject?.emit(entity);
  }
}