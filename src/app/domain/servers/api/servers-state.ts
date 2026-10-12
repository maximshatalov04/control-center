import { Injectable, inject, signal, computed } from '@angular/core';
import { ServersState } from '../models/servers-state';
import { ServersApiService } from './servers-api';
import { ServerInfo, ServerMetrics, ServerWithMetrics } from '../models/server-info';
import { Observable, switchMap, forkJoin, map, catchError, of, tap, EMPTY, finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServersStateService {
  private readonly api = inject(ServersApiService);

  readonly #state = signal<ServersState>({
    servers: [],
    loading: true,
    error: undefined,
  });

  // --- State ---
  readonly servers = computed(() => this.#state().servers);

  // --- Computed ---
  public readonly loading = computed(() => this.#state().loading);
  public readonly error = computed(() => this.#state().error);

  // --- Methods ---
  loadAll(): Observable<ServerWithMetrics[]> {
    this.#patch({ loading: true, error: undefined });

    return this.api.getAll().pipe(
      switchMap((servers: ServerInfo[]) => {
        if (!servers || !servers.length)
          return forkJoin([]);

        const metricsRequests$ = servers.map(server =>
          this.api.getMetrics(server.id).pipe(
            // Склеиваем с метриками при успешном ответе
            map(metrics => ({ ...server, metrics })),
            catchError((err): Observable<ServerWithMetrics> => {
              console.error(`Не удалось загрузить метрики для сервера ${server.id}:`, err);
              // Возвращаем объект базы с дефолтными/пустыми метриками
              // Это гарантирует, что forkJoin успешно завершится
              return of({ ...server, metrics: undefined });
            })
          )
        );

        return forkJoin(metricsRequests$);
      }),
      tap((serversWithMetrics) => {
        this.#patch({
          servers: serversWithMetrics,
          loading: false
        });
      }),
      catchError(err => {
        this.#patch({ error: err.message, loading: false });
        return EMPTY;
      }),
    );
  }

  getServersByIds(ids: string[] | undefined): Observable<ServerWithMetrics[]> {
    this.#patch({ loading: true, error: undefined });

    if (!ids || ids.length === 0) {
      this.#patch({ loading: false });
      return of([]);
    }

    const uniqueIds = [...new Set(ids)];
    const currentServers = this.#state().servers;

    // Шаг 1: Ищем серверы, которые уже сохранены в стейте
    const cachedServers = currentServers.filter((server) => uniqueIds.includes(server.id));
    const cachedIdsSet = new Set(cachedServers.map((server) => server.id));

    // Находим ID тех баз, которых нет в стейте и которые нужно запросить из API
    const missingIds = uniqueIds.filter((id) => !cachedIdsSet.has(id));

    // Если все запрашиваемые серверы уже есть в стейте, сразу возвращаем их без HTTP-запросов
    if (missingIds.length === 0) {
      this.#patch({ loading: false });
      return of(cachedServers);
    }

    // Шаг 2: Загружаем из API только отсутствующие серверы
    return forkJoin(
      missingIds.map((id) =>
        this.api.getById(id).pipe(
          catchError((err) => {
            console.error(`Не удалось загрузить сервер с id ${id}:`, err);
            return of(undefined);
          })
        )
      )
    ).pipe(
      map((results) => results.filter((server): server is ServerInfo => server !== undefined)),

      // Шаг 3: Для успешно загруженных из API серверов параллельно запрашиваем метрики
      switchMap((fetchedServers) => {
        if (fetchedServers.length === 0) {
          return of(cachedServers);
        }

        const metricsRequests$ = fetchedServers.map((server) =>
          this.api.getMetrics(server.id).pipe(
            map((metrics: ServerMetrics) => ({
              ...server,
              metrics: {
                status: metrics.status,
                lastStartAt: metrics.lastStartAt,
                cpuUsagePercent: metrics.cpuUsagePercent,
                memoryUsagePercent: metrics.memoryUsagePercent,
                diskUsagePercent: metrics.diskUsagePercent,
              },
            })),
            catchError((err): Observable<ServerWithMetrics> => {
              console.error(`Не удалось загрузить метрики для сервера ${server.id}:`, err);
              return of({ ...server, metrics: undefined });
            })
          )
        );

        return forkJoin(metricsRequests$).pipe(
          // Объединяем старые кэшированные данные со свежезагруженными
          map((newServersWithMetrics) => [...cachedServers, ...newServersWithMetrics])
        );
      }),
      tap((allRequestedServers) => {
        // Обновляем стейт: берем серверы, которые не участвовали в запросе, 
        // и добавляем к ним полный актуальный список запрошенных серверов
        const requestedIdsSet = new Set(uniqueIds);
        const notRequested = this.#state().servers.filter(server => !requestedIdsSet.has(server.id));

        this.#patch({
          servers: [...notRequested, ...allRequestedServers],
          loading: false
        });
      }),
      catchError((error) => {
        this.#patch({ error: error.message, loading: false });
        return EMPTY;
      })
    );
  }

  getServerById(id: string): Observable<ServerWithMetrics | undefined> {
    if (!id) return of(undefined);

    return this.getServersByIds([id]).pipe(
      map((servers) => servers[0])
    );
  }

  refreshMetrics(id: string): Observable<ServerMetrics> {
    if (!id) return EMPTY;

    return this.api.getMetrics(id).pipe(
      tap((metrics) => {
        const currentServers = this.#state().servers;

        // Проверяем, есть ли вообще такой сервер в стейте
        const serverExists = currentServers.some(server => server.id === id);
        if (!serverExists) return;

        // Создаем абсолютно новый массив, заменив в нем только один сервер
        const updatedServers = currentServers.map((server) =>
          server.id === id
            ? { ...server, metrics } // Обновляем метрики иммутабельно
            : server                 // Остальные оставляем как есть
        );

        // Обновляем состояние правильным массивом
        this.#patch({ servers: updatedServers });
      }),
      catchError((error: Error) => {
        this.#patch({ error: error.message });
        return EMPTY;
      }),
      finalize(() => this.#patch({ loading: false })),
    );
  }

  #patch(part: Partial<ServersState>): void {
    this.#state.update((state) => ({ ...state, ...part }));
  }
}
