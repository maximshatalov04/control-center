import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MOCK_SERVERS } from '../../../../shared/data/servers';
import { formatSize, getUsagePercent } from '../../../../shared/utils/file-utils';
import { getArchiveStatusColor } from '../../../../shared/utils/status-utils';
import { FileArchiveInfo } from '../../models/file-archive-info';

@Component({
  imports: [DatePipe],
  selector: 'app-file-archive-dashboard',
  styleUrl: './file-archive-dashboard.component.scss',
  templateUrl: './file-archive-dashboard.component.html',
})
export class FileArchiveDashboardComponent {
  readonly #servers = MOCK_SERVERS;
  readonly archiveId = input<string>();

  public readonly getArchiveStatusColor = getArchiveStatusColor;
  public readonly formatSize = formatSize;
  public readonly getUsagePercent = getUsagePercent;

  /** Текущий архив с привязкой к родительской БД и серверу */
  readonly archive = computed(() => {
    const id = this.archiveId();
    if (!id) return undefined;

    for (const s of this.#servers) {
      for (const db of s.databases ?? []) {
        const arch = db.archives?.find(a => a.id === id);
        if (arch) {
          return {
            ...arch,
            databaseName: db.name,
            databaseId: db.id,
            serverName: s.name,
            serverId: s.id,
          };
        }
      }
    }
    return undefined;
  });

  readonly usagePercent = computed(() => {
    const archive = this.archive();
    if (!archive)
      return 0;
    return getUsagePercent(archive?.maxCapacityBytes, archive?.usedBytes);
  })

  /** Другие архивы той же БД (без текущего) */
  readonly siblingArchives = computed(() => {
    const current = this.archive();
    if (!current?.databaseId) return [];

    for (const s of this.#servers) {
      const db = s.databases?.find(d => d.id === current.databaseId);
      if (db?.archives) {
        return db.archives.filter(a => a.id !== this.archiveId());
      }
    }
    return [];
  });

  getAverageFileSize(): number {
    const a = this.archive();
    if (!a || !a.fileCount) return 0;
    return Math.round(a.usedBytes / a.fileCount);
  }

  navigateToDatabase(databaseId: string) {
    console.log('Переход к БД:', databaseId);
  }

  navigateToServer(serverId: string) {
    console.log('Переход к серверу:', serverId);
  }

  openArchiveDetails(archive: FileArchiveInfo) {
    console.log('Открыть детали архивa:', archive);
  }
}
