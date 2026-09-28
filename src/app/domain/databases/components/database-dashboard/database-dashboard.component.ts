import { Component, computed, input, signal } from '@angular/core';
import { FileArchiveInfo } from '../../../file-archives/models/file-archive-info';
import { MOCK_SERVERS } from '../../../../shared/data/servers';
import { getArchiveStatusColor, getDatabaseStatusColor } from '../../../../shared/utils/status-utils';
import { formatSize, getUsagePercent } from '../../../../shared/utils/file-utils';
import { DatePipe } from '@angular/common';
import { BadgeComponent } from '../../../../ui/components/badge/badge.component';
import { PanelComponent } from '../../../../ui/components/panel/panel.component';
import { ButtonComponent } from '../../../../ui/components/button/button.component';
import { ProgressBarComponent } from '../../../../ui/components/progress-bar/progress-bar.component';
import { CardComponent } from '../../../../ui/components/card/card.component';
import { InfoItemComponent } from '../../../../ui/components/info-item/info-item.component';

@Component({
  imports: [DatePipe, PanelComponent, BadgeComponent, ButtonComponent, ProgressBarComponent, CardComponent, InfoItemComponent],
  selector: 'app-database-dashboard',
  styleUrl: './database-dashboard.component.scss',
  templateUrl: './database-dashboard.component.html',
})
export class DatabaseDashboardComponent {
  readonly #servers = MOCK_SERVERS;
  readonly databaseId = input<string>();
  readonly showConnectionString = signal(false);

  public readonly getDatabaseStatusColor = getDatabaseStatusColor;
  public readonly getArchiveStatusColor = getArchiveStatusColor;
  public readonly formatSize = formatSize;
  public readonly getUsagePercent = getUsagePercent;

  readonly database = computed(() => {
    const id = this.databaseId();
    if (!id) return undefined;

    for (const s of this.#servers) {
      const db = s.databases?.find(d => d.id === id);
      if (db) {
        return {
          ...db,
          serverName: s.name,
          serverId: s.id,
        };
      }
    }
    return undefined;
  });

  readonly databases = computed(() => {
    const id = this.databaseId();
    if (!id) return [];

    for (const s of this.#servers) {
      const found = s.databases?.find(d => d.id === id);
      if (found) {
        return s.databases;
      }
    }
    return [];
  });

  navigateToServer(serverId: string) {
    console.log('Переход к серверу:', serverId);
  }

  openArchiveDetails(archive: FileArchiveInfo) {
    console.log('Открыть детали архивa:', archive);
  }
}