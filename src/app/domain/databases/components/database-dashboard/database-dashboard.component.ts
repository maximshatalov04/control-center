import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { FileArchiveInfo, FileArchiveWithMetrics } from '../../../file-archives/models/file-archive-info';
import { getArchiveStatusColor, getDatabaseStatusColor } from '../../../../shared/utils/status-utils';
import { formatSize, getUsagePercent } from '../../../../shared/utils/file-utils';
import { DatePipe } from '@angular/common';
import { BadgeComponent } from '../../../../ui/components/badge/badge.component';
import { PanelComponent } from '../../../../ui/components/panel/panel.component';
import { ButtonComponent } from '../../../../ui/components/button/button.component';
import { ProgressBarComponent } from '../../../../ui/components/progress-bar/progress-bar.component';
import { CardComponent } from '../../../../ui/components/card/card.component';
import { InfoItemComponent } from '../../../../ui/components/info-item/info-item.component';
import { ServersStateService } from '../../../servers/api/servers-state';
import { Router } from '@angular/router';
import { DatabasesStateService } from '../../api/databases-state';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, Observable, switchMap, timer } from 'rxjs';
import { ServerWithMetrics } from '../../../servers/models/server-info';
import { DatabaseWithMetrics } from '../../models/database-info';
import { FileArchivesStateService } from '../../../file-archives/api/file-archives-state';
import { EmptyStateComponent } from '../../../../layout/components/empty-state/empty-state.component';

@Component({
  imports: [DatePipe, PanelComponent, BadgeComponent, ButtonComponent, ProgressBarComponent, CardComponent, InfoItemComponent, EmptyStateComponent],
  selector: 'app-database-dashboard',
  styleUrl: './database-dashboard.component.scss',
  templateUrl: './database-dashboard.component.html',
})
export class DatabaseDashboardComponent {
  readonly #servers = inject(ServersStateService);
  readonly #databases = inject(DatabasesStateService);
  readonly #archives = inject(FileArchivesStateService);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);

  // Значения из маршрута
  readonly serverId = input.required<string>();
  readonly databaseId = input.required<string>();

  readonly showConnectionString = signal(false);

  public readonly getDatabaseStatusColor = getDatabaseStatusColor;
  public readonly getArchiveStatusColor = getArchiveStatusColor;
  public readonly formatSize = formatSize;
  public readonly getUsagePercent = getUsagePercent;

  readonly database = toSignal(
    toObservable(this.databaseId).pipe(
      switchMap(id => this.#databases.getDatabaseById(id)),
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

  readonly databases = toSignal(
    toObservable(this.server).pipe(
      switchMap((server: ServerWithMetrics | undefined): Observable<DatabaseWithMetrics[]> => {
        // Если сервер еще не загрузился или у него нет баз, возвращаем пустой массив
        if (!server || !server.databaseIds || server.databaseIds.length === 0) {
          return EMPTY;
        }
        // Загружаем базы по ID
        return this.#databases.getDatabasesByIds(server.databaseIds);
      }),
      takeUntilDestroyed(this.#destroyRef)
    ),
    { initialValue: [] as DatabaseWithMetrics[] } // Инициализируем пустым массивом
  );

  readonly archives = toSignal(
    toObservable(this.database).pipe(
      switchMap((database: DatabaseWithMetrics | undefined): Observable<FileArchiveWithMetrics[]> => {
        // Если БД еще не загрузилась или у нее нет архивов, возвращаем пустой массив
        if (!database || !database.archiveIds || database.archiveIds.length === 0) {
          // эмитим [] и делаем complete, а не просто complete (EMPTY)
          return new Observable<FileArchiveWithMetrics[]>(subscriber => {
            subscriber.next([]);
            subscriber.complete();
          });
        }
        // Загружаем базы по ID
        return this.#archives.getArchivesByIds(database.archiveIds);
      }),
      takeUntilDestroyed(this.#destroyRef)
    ),
    { initialValue: [] as FileArchiveWithMetrics[] } // Инициализируем пустым массивом
  );

  readonly metrics = toSignal(
    toObservable(this.databaseId).pipe(
      filter(id => !!id),
      switchMap(id =>
        timer(0, 2000).pipe( // первый запрос сразу, потом каждые 2 сек
          switchMap(() => this.#databases.refreshMetrics(id).pipe(
            catchError((err) => {
              console.error(`Ошибка обновления метрик для БД ${id}:`, err);
              return EMPTY; // пустой поток без complete
            })
          ))
        )
      ),
      takeUntilDestroyed(this.#destroyRef)
    ),
    { initialValue: null }
  );

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