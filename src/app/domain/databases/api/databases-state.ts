import { Injectable, inject, signal, computed } from '@angular/core';
import { DatabaseInfo, DatabaseMetrics, DatabaseWithMetrics } from '../models/database-info';
import { DatabasesApiService } from './databases-api';
import { DatabasesState } from '../models/databases-state';
import { catchError, EMPTY, finalize, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DatabasesStateService {
  private readonly api = inject(DatabasesApiService);
  readonly #state = signal<DatabasesState>({
    databases: [],
    loading: true,
    error: undefined,
  });

  // --- State ---
  readonly databases = computed(() => this.#state().databases);

  // --- Computed ---
  public readonly loading = computed(() => this.#state().loading);
  public readonly error = computed(() => this.#state().error);

  // --- Methods ---
  loadAll(): Observable<DatabaseWithMetrics[]> {
    this.#patch({ loading: true, error: undefined });

    return this.api.getAll().pipe(
      switchMap((databases: DatabaseInfo[]) => {
        if (!databases || !databases.length)
          return forkJoin([]);

        const metricsRequests$ = databases.map(db =>
          this.api.getMetrics(db.id).pipe(
            // Склеиваем базу с метриками при успешном ответе
            map(metrics => ({ ...db, metrics })),
            catchError((err): Observable<DatabaseWithMetrics> => {
              console.error(`Не удалось загрузить метрики для БД ${db.id}:`, err);
              // Возвращаем объект базы с дефолтными/пустыми метриками
              // Это гарантирует, что forkJoin успешно завершится для остальных БД
              return of({ ...db, metrics: undefined });
            })
          )
        );

        return forkJoin(metricsRequests$);
      }),
      tap((databasesWithMetrics) => {
        this.#patch({
          databases: databasesWithMetrics,
          loading: false
        });
      }),
      catchError(err => {
        this.#patch({ error: err.message, loading: false });
        return EMPTY;
      }),
    );
  }

  getDatabasesByIds(ids: string[] | undefined): Observable<DatabaseWithMetrics[]> {
    this.#patch({ loading: true, error: undefined });

    if (!ids || ids.length === 0) {
      this.#patch({ loading: false });
      return of([]);
    }

    const uniqueIds = [...new Set(ids)];
    const currentDatabases = this.#state().databases;

    // Шаг 1: Ищем базы, которые уже сохранены в стейте
    const cachedDatabases = currentDatabases.filter((db) => uniqueIds.includes(db.id));
    const cachedIdsSet = new Set(cachedDatabases.map((db) => db.id));

    // Находим ID тех баз, которых нет в стейте и которые нужно запросить из API
    const missingIds = uniqueIds.filter((id) => !cachedIdsSet.has(id));

    // Если все запрашиваемые базы уже есть в стейте, сразу возвращаем их без HTTP-запросов
    if (missingIds.length === 0) {
      this.#patch({ loading: false });
      return of(cachedDatabases);
    }

    // Шаг 2: Загружаем из API только отсутствующие базы
    return forkJoin(
      missingIds.map((id) =>
        this.api.getById(id).pipe(
          catchError((err) => {
            console.error(`Не удалось загрузить БД с id ${id}:`, err);
            return of(undefined);
          })
        )
      )
    ).pipe(
      map((results) => results.filter((db): db is DatabaseInfo => db !== undefined)),

      // Шаг 3: Для успешно загруженных из API баз параллельно запрашиваем метрики
      switchMap((fetchedDatabases) => {
        if (fetchedDatabases.length === 0) {
          return of(cachedDatabases);
        }

        const metricsRequests$ = fetchedDatabases.map((db) =>
          this.api.getMetrics(db.id).pipe(
            map((metrics) => ({
              ...db,
              metrics: {
                status: metrics.status,
                sizeBytes: metrics.sizeBytes,
                logSizeBytes: metrics.logSizeBytes,
                lastBackupAt: metrics.lastBackupAt,
              },
            })),
            catchError((err): Observable<DatabaseWithMetrics> => {
              console.error(`Не удалось загрузить метрики для БД ${db.id}:`, err);
              return of({ ...db, metrics: undefined });
            })
          )
        );

        return forkJoin(metricsRequests$).pipe(
          // Объединяем старые кэшированные данные со свежезагруженными
          map((newDatabasesWithMetrics) => [...cachedDatabases, ...newDatabasesWithMetrics])
        );
      }),
      tap((allRequestedDatabases) => {
        // Обновляем стейт: берем базы, которые не участвовали в запросе, 
        // и добавляем к ним полный актуальный список запрошенных баз
        const requestedIdsSet = new Set(uniqueIds);
        const notRequested = this.#state().databases.filter(db => !requestedIdsSet.has(db.id));

        this.#patch({
          databases: [...notRequested, ...allRequestedDatabases],
          loading: false
        });
      }),
      catchError((error) => {
        this.#patch({ error: error.message, loading: false });
        return EMPTY;
      })
    );
  }

  getDatabaseById(id: string): Observable<DatabaseWithMetrics | undefined> {
    if (!id) return of(undefined);

    return this.getDatabasesByIds([id]).pipe(
      map((databases) => databases[0])
    );
  }

  refreshMetrics(id: string): Observable<DatabaseMetrics> {
    if (!id) return EMPTY;

    return this.api.getMetrics(id).pipe(
      tap((metrics) => {
        const currentDatabases = this.#state().databases;

        // Проверяем, есть ли вообще такая база данных в стейте
        const dbExists = currentDatabases.some(db => db.id === id);
        if (!dbExists) return;

        // Создаем абсолютно новый массив, заменив в нем только одну базу данных
        const updatedDatabases = currentDatabases.map((db) =>
          db.id === id
            ? { ...db, metrics } // Обновляем метрики иммутабельно
            : db                 // Остальные оставляем как есть
        );

        // Обновляем состояние правильным массивом
        this.#patch({ databases: updatedDatabases });
      }),
      catchError((error: Error) => {
        this.#patch({ error: error.message });
        return EMPTY;
      }),
      finalize(() => this.#patch({ loading: false })),
    );
  }

  #patch(part: Partial<DatabasesState>): void {
    this.#state.update((state) => ({ ...state, ...part }));
  }
}
