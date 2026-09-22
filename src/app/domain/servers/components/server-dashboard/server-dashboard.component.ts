import { Component, computed, input } from '@angular/core';
import { DatabaseInfo } from '../../../databases/models/database-info';
import { DatePipe } from '@angular/common';
import { MOCK_SERVERS } from '../../../../shared/data/servers';
import { getDatabaseStatusColor, getServerStatusColor } from '../../../../shared/utils/status-utils';
import { formatSize } from '../../../../shared/utils/file-utils';

@Component({
  imports: [DatePipe],
  selector: 'app-server-dashboard',
  styleUrl: './server-dashboard.component.scss',
  templateUrl: './server-dashboard.component.html',
})

export class ServerDashboardComponent {
  readonly #servers = MOCK_SERVERS;
  readonly serverId = input<string>();
  readonly server = computed(() => {
    const serverId = this.serverId();
    return this.#servers.find(s => s.id === serverId)
  });

  public readonly getDatabaseStatusColor = getDatabaseStatusColor;
  public readonly getServerStatusColor = getServerStatusColor;
  public readonly formatSize = formatSize;

  openDbDetails(db: DatabaseInfo) {
    // Здесь логика открытия детальной карточки БД (редирект)
    console.log('Открыть детали БД:', db);
  }
}
