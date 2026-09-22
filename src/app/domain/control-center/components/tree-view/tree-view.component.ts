import { Component, computed, output, signal } from '@angular/core';
import { Entity } from '../../../../shared/models/entity';
import { Server } from '../../../../shared/models/server';

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

  readonly servers = signal<Server[]>(
    [
      {
        id: 'srv-001',
        name: 'Сервер приложений PROD-01',
        type: 'server',
        databases: [
          {
            id: 'db-001-1',
            name: 'PROD_MAIN_DB',
            type: 'database',
            archives: [
              {
                id: 'arch-001-1-1',
                name: 'Backup_2024_Q4',
                type: 'archive',
              },
              {
                id: 'arch-001-1-2',
                name: 'Logs_Archive_2024',
                type: 'archive',
              }
            ]
          },
          {
            id: 'db-001-2',
            name: 'PROD_ANALYTICS_DB',
            type: 'database',
            archives: [
              {
                id: 'arch-001-2-1',
                name: 'Analytics_Daily_Export',
                type: 'archive',
              }
            ]
          }
        ]
      },
      {
        id: 'srv-002',
        name: 'Сервер приложений STAGE-02',
        type: 'server',
        databases: [
          {
            id: 'db-002-1',
            name: 'STAGE_MAIN_DB',
            type: 'database',
            archives: [
              {
                id: 'arch-002-1-1',
                name: 'Stage_Backup_Test',
                type: 'archive',
              }
            ]
          },
          {
            id: 'db-002-2',
            name: 'STAGE_TEMP_DB',
            type: 'database',
            archives: []
          }
        ]
      },
      {
        id: 'srv-003',
        name: 'Сервер приложений DEV-03',
        type: 'server',
        databases: [
          {
            id: 'db-003-1',
            name: 'DEV_MAIN_DB',
            type: 'database',
            archives: [
              {
                id: 'arch-003-1-1',
                name: 'Dev_Snapshot_20241010',
                type: 'archive',
              }
            ]
          },
          {
            id: 'db-003-2',
            name: 'DEV_TEST_DB',
            type: 'database',
            archives: []
          },
          {
            id: 'db-003-3',
            name: 'DEV_LOGGING_DB',
            type: 'database',
            archives: [
              {
                id: 'arch-003-3-1',
                name: 'Log_Dump_2024',
                type: 'archive',
              },
              {
                id: 'arch-003-3-2',
                name: 'Metrics_Export_2024',
                type: 'archive',
              }
            ]
          }
        ]
      },
      {
        id: 'srv-004',
        name: 'Сервер приложений DR-04 (Резервный)',
        type: 'server',
        databases: [
          {
            id: 'db-004-1',
            name: 'DR_SYNC_DB',
            type: 'database',
            archives: [
              {
                id: 'arch-004-1-1',
                name: 'DR_Sync_Snapshot',
                type: 'archive',
              }
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