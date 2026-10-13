import { Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { DatabaseInfo, DatabaseWithMetrics } from '../../../databases/models/database-info';
import { DatePipe } from '@angular/common';
import { getDatabaseStatusColor, getServerStatusColor } from '../../../../shared/utils/status-utils';
import { formatSize } from '../../../../shared/utils/file-utils';
import { PanelComponent } from '../../../../ui/components/panel/panel.component';
import { CardComponent } from '../../../../ui/components/card/card.component';
import { ButtonComponent } from '../../../../ui/components/button/button.component';
import { BadgeComponent } from '../../../../ui/components/badge/badge.component';
import { ProgressBarComponent } from '../../../../ui/components/progress-bar/progress-bar.component';
import { InfoItemComponent } from '../../../../ui/components/info-item/info-item.component';
import { MetricCardComponent } from '../../../../ui/components/metric-card/metric-card.component';
import { ServersStateService } from '../../api/servers-state';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, Observable, switchMap, take, timer } from 'rxjs';
import { Router } from '@angular/router';
import { DatabasesStateService } from '../../../databases/api/databases-state';
import { ServerWithMetrics } from '../../models/server-info';
import { EmptyStateComponent } from '../../../../layout/components/empty-state/empty-state.component';
import { Spinner } from '../../../../ui/components/spinner/spinner';
import { ElectronService } from '../../../../core/services/electron/electron.service';

@Component({
  imports: [DatePipe, PanelComponent, CardComponent, ButtonComponent, BadgeComponent, ProgressBarComponent, InfoItemComponent, MetricCardComponent, EmptyStateComponent, Spinner],
  selector: 'app-server-dashboard',
  styleUrl: './server-dashboard.component.scss',
  templateUrl: './server-dashboard.component.html',
})

export class ServerDashboardComponent implements OnInit {
  readonly #servers = inject(ServersStateService);
  readonly #databases = inject(DatabasesStateService);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);
  readonly #electronService = inject(ElectronService);

  // Значение из маршрута
  readonly serverId = input.required<string>();

  // Прелоадеры
  readonly serversLoading = computed(() => this.#servers.loading());
  readonly databasesLoading = computed(() => this.#databases.loading());

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

  readonly metrics = toSignal(
    toObservable(this.serverId).pipe(
      filter(id => !!id),
      switchMap(id =>
        timer(0, 2000).pipe( // первый запрос сразу, потом каждые 2 сек
          switchMap(() => this.#servers.refreshMetrics(id).pipe(
            catchError((err) => {
              console.error(`Ошибка обновления метрик для сервера ${id}:`, err);
              return EMPTY; // пустой поток без complete
            })
          ))
        )
      ),
      takeUntilDestroyed(this.#destroyRef)
    ),
    { initialValue: null }
  );

  public readonly getDatabaseStatusColor = getDatabaseStatusColor;
  public readonly getServerStatusColor = getServerStatusColor;
  public readonly formatSize = formatSize;

  openDbDetails(db: DatabaseInfo) {
    void this.#router.navigate([
      '/info',
      'server', this.serverId(),
      'database', db.id]);
  }

  ngOnInit(): void {
    this.#databases.loadAll().pipe(take(1))
      .subscribe();
  };

  async saveServerConfig(): Promise<void> {
    const server = this.server();
    if (!server) {
      console.warn('Сервер не загружен, нельзя сохранить конфигурацию');
      return;
    }

    // Формируем объект конфигурации (можно расширить по необходимости)
    const config = {
      id: server.id,
      name: server.name,
      ipAddress: server.ipAddress,
      port: server.port,
      softwareVersion: server.softwareVersion,
      os: server.os,
      description: server.description,
      databaseIds: server.databaseIds,
      metrics: this.metrics()
    };

    const jsonString = JSON.stringify(config, null, 2);
    const fileName = `server-config-${server.id}.json`;

    if (this.#electronService.isElectron) {
      await this.saveToDiskElectron(jsonString, fileName);
    } else {
      this.downloadFileWeb(jsonString, fileName);
    }
  }

  private downloadFileWeb(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private async saveToDiskElectron(content: string, defaultName: string): Promise<void> {
    // 1. Показать диалог выбора пути
    const filePath = await this.#electronService.showSaveDialog(defaultName);

    if (!filePath) {
      // Пользователь отменил
      return;
    }

    // 2. Отправить данные на запись в главный процесс
    try {
      await this.#electronService.writeFile(filePath, content);
      alert(`Конфигурация сервера успешно сохранена:\n${filePath}`);
    } catch (err) {
      console.error('Ошибка сохранения файла:', err);
      alert('Не удалось сохранить файл. Проверьте права доступа и путь.');
    }
  }
}