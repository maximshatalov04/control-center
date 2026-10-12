import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, input } from '@angular/core';
import { formatSize, getUsagePercent } from '../../../../shared/utils/file-utils';
import { getArchiveStatusColor } from '../../../../shared/utils/status-utils';
import { FileArchiveInfo, FileArchiveWithMetrics } from '../../models/file-archive-info';
import { BadgeComponent } from '../../../../ui/components/badge/badge.component';
import { PanelComponent } from '../../../../ui/components/panel/panel.component';
import { ProgressBarComponent } from '../../../../ui/components/progress-bar/progress-bar.component';
import { MetricCardComponent } from '../../../../ui/components/metric-card/metric-card.component';
import { ButtonComponent } from '../../../../ui/components/button/button.component';
import { CardComponent } from '../../../../ui/components/card/card.component';
import { InfoItemComponent } from '../../../../ui/components/info-item/info-item.component';
import { Router } from '@angular/router';
import { DatabasesStateService } from '../../../databases/api/databases-state';
import { ServersStateService } from '../../../servers/api/servers-state';
import { FileArchivesStateService } from '../../api/file-archives-state';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatestWith, EMPTY, filter, Observable, switchMap, timer, of } from 'rxjs';
import { EmptyStateComponent } from '../../../../layout/components/empty-state/empty-state.component';

@Component({
  imports: [DatePipe, PanelComponent, BadgeComponent, ProgressBarComponent, MetricCardComponent, ButtonComponent, CardComponent, InfoItemComponent, EmptyStateComponent],
  selector: 'app-file-archive-dashboard',
  styleUrl: './file-archive-dashboard.component.scss',
  templateUrl: './file-archive-dashboard.component.html',
})
export class FileArchiveDashboardComponent {
  readonly #servers = inject(ServersStateService);
  readonly #databases = inject(DatabasesStateService);
  readonly #archives = inject(FileArchivesStateService);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);

  // Значения из маршрута
  readonly serverId = input.required<string>();
  readonly databaseId = input.required<string>();
  readonly archiveId = input.required<string>();

  public readonly getArchiveStatusColor = getArchiveStatusColor;
  public readonly formatSize = formatSize;
  public readonly getUsagePercent = getUsagePercent;

  readonly archive = toSignal(
    toObservable(this.archiveId).pipe(
      switchMap(id => this.#archives.getArchiveById(id)),
      takeUntilDestroyed(this.#destroyRef)
    ),
    { initialValue: undefined }
  );

  readonly server = toSignal(
    toObservable(this.serverId).pipe(
      switchMap(id => this.#servers.getServerById(id)),
      takeUntilDestroyed(this.#destroyRef)
    ),
    { initialValue: undefined }
  );

  readonly database = toSignal(
    toObservable(this.databaseId).pipe(
      switchMap(id => this.#databases.getDatabaseById(id)),
      takeUntilDestroyed(this.#destroyRef)
    ),
    { initialValue: undefined }
  );

  readonly usagePercent = computed(() => {
    const archive = this.archive();
    const metrics = this.metrics();
    if (!archive)
      return 0;
    return getUsagePercent(archive?.maxCapacityBytes, metrics?.usedBytes ?? 0);
  })

  readonly siblingArchives = toSignal(
    toObservable(this.archiveId).pipe(
      // Добавляем архив в поток: теперь при смене archiveId будет новый тик
      combineLatestWith(toObservable(this.database)),
      switchMap(([currentId, database]): Observable<FileArchiveWithMetrics[]> => {
        // Если БД ещё не загрузилась — возвращаем пустой массив корректно
        if (!database || !database.archiveIds?.length) {
          return of([]);
        }

        // Фильтруем ID
        const siblingIds = database.archiveIds.filter(id => id !== currentId);

        // Если других архивов нет — сразу возвращаем пустой массив
        if (siblingIds.length === 0) {
          return of([]);
        }

        return this.#archives.getArchivesByIds(siblingIds);
      }),
      takeUntilDestroyed(this.#destroyRef)
    ),
    { initialValue: [] as FileArchiveWithMetrics[] }
  );

  readonly metrics = toSignal(
    toObservable(this.archiveId).pipe(
      filter(id => !!id),
      switchMap(id =>
        timer(0, 2000).pipe( // первый запрос сразу, потом каждые 2 сек
          switchMap(() => this.#archives.refreshMetrics(id).pipe(
            catchError((err) => {
              console.error(`Ошибка обновления метрик для файлового архива ${id}:`, err);
              return EMPTY; // пустой поток без complete
            })
          ))
        )
      ),
      takeUntilDestroyed(this.#destroyRef)
    ),
    { initialValue: null }
  );

  archiveUsagePercent(archive: FileArchiveWithMetrics) {
    if (!archive)
      return 0;
    return getUsagePercent(archive?.maxCapacityBytes, archive?.metrics?.usedBytes ?? 0);
  }

  getAverageFileSize(): number {
    const archive = this.archive();
    const metrics = this.metrics();
    if (!archive || !metrics?.fileCount) return 0;
    return Math.round(metrics?.usedBytes / metrics?.fileCount);
  }

  navigateToDatabase() {
    void this.#router.navigate([
      '/info',
      'server', this.serverId(),
      'database', this.databaseId()]);
  }

  navigateToServer() {
    void this.#router.navigate([
      '/info',
      'server', this.serverId()]);
  }

  openArchiveDetails(archive: FileArchiveInfo) {
    void this.#router.navigate([
      '/info',
      'server', this.serverId(),
      'database', this.databaseId(),
      'archive', archive.id,
    ]);
  }
}
