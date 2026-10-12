import { Injectable, inject, signal, computed } from '@angular/core';
import { FileArchiveInfo, FileArchiveMetrics, FileArchiveWithMetrics } from '../models/file-archive-info';
import { Observable, switchMap, forkJoin, map, catchError, tap, EMPTY, of, finalize } from 'rxjs';
import { FileArchivesApiService } from './file-archives-api';
import { FileArchivesState } from '../models/file-archives-state';

@Injectable({ providedIn: 'root' })
export class FileArchivesStateService {
  private readonly api = inject(FileArchivesApiService);

  readonly #state = signal<FileArchivesState>({
    archives: [],
    loading: true,
    error: undefined,
  });

  // --- State ---
  readonly archives = computed(() => this.#state().archives);

  // --- Computed ---
  public readonly loading = computed(() => this.#state().loading);
  public readonly error = computed(() => this.#state().error);

  // --- Methods ---
  loadAll(): Observable<FileArchiveWithMetrics[]> {
    this.#patch({ loading: true, error: undefined });

    return this.api.getAll().pipe(
      switchMap((archives: FileArchiveInfo[]) => {
        if (!archives || !archives.length)
          return forkJoin([]);

        const metricsRequests$ = archives.map(archive =>
          this.api.getMetrics(archive.id).pipe(
            // Склеиваем с метриками при успешном ответе
            map(metrics => ({ ...archive, metrics })),
            catchError((err): Observable<FileArchiveWithMetrics> => {
              console.error(`Не удалось загрузить метрики для файлового архива ${archive.id}:`, err);
              // Возвращаем объект базы с дефолтными/пустыми метриками
              // Это гарантирует, что forkJoin успешно завершится
              return of({ ...archive, metrics: undefined });
            })
          )
        );

        return forkJoin(metricsRequests$);
      }),
      tap((archivesWithMetrics) => {
        this.#patch({
          archives: archivesWithMetrics,
          loading: false
        });
      }),
      catchError(err => {
        this.#patch({ error: err.message, loading: false });
        return EMPTY;
      }),
    );
  }

  getArchivesByIds(ids: string[] | undefined): Observable<FileArchiveWithMetrics[]> {
    this.#patch({ loading: true, error: undefined });

    if (!ids || ids.length === 0) {
      this.#patch({ loading: false });
      return of([]);
    }

    const uniqueIds = [...new Set(ids)];
    const currentArchives = this.#state().archives;

    // Шаг 1: Ищем архивы, которые уже сохранены в стейте
    const cachedArchives = currentArchives.filter((archive) => uniqueIds.includes(archive.id));
    const cachedIdsSet = new Set(cachedArchives.map((archive) => archive.id));

    // Находим ID тех архивов, которых нет в стейте и которые нужно запросить из API
    const missingIds = uniqueIds.filter((id) => !cachedIdsSet.has(id));

    // Если все запрашиваемые архивы уже есть в стейте, сразу возвращаем их без HTTP-запросов
    if (missingIds.length === 0) {
      this.#patch({ loading: false });
      return of(cachedArchives);
    }

    // Шаг 2: Загружаем из API только отсутствующие архивы
    return forkJoin(
      missingIds.map((id) =>
        this.api.getById(id).pipe(
          catchError((err) => {
            console.error(`Не удалось загрузить архив с id ${id}:`, err);
            return of(undefined);
          })
        )
      )
    ).pipe(
      map((results) => results.filter((archive): archive is FileArchiveInfo => archive !== undefined)),

      // Шаг 3: Для успешно загруженных из API архивов параллельно запрашиваем метрики
      switchMap((fetchedArchives) => {
        if (fetchedArchives.length === 0) {
          return of(cachedArchives);
        }

        const metricsRequests$ = fetchedArchives.map((archive) =>
          this.api.getMetrics(archive.id).pipe(
            map((metrics: FileArchiveMetrics) => ({
              ...archive,
              metrics: {
                status: metrics.status,
                usedBytes: metrics.usedBytes,
                fileCount: metrics.fileCount,
                lastModifiedAt: metrics.lastModifiedAt
              },
            })),
            catchError((err) => {
              console.error(`Не удалось загрузить метрики для архива ${archive.id}:`, err);
              return of({ ...archive, metrics: undefined });
            })
          )
        );

        return forkJoin(metricsRequests$).pipe(
          // Объединяем старые кэшированные данные со свежезагруженными
          map((newArchivesWithMetrics) => [...cachedArchives, ...newArchivesWithMetrics])
        );
      }),
      tap((allRequestedArchives) => {
        // Обновляем стейт: берем архивы, которые не участвовали в запросе, 
        // и добавляем к ним полный актуальный список запрошенных архивов
        const requestedIdsSet = new Set(uniqueIds);
        const notRequested = this.#state().archives.filter(db => !requestedIdsSet.has(db.id));

        this.#patch({
          archives: [...notRequested, ...allRequestedArchives],
          loading: false
        });
      }),
      catchError((error) => {
        this.#patch({ error: error.message, loading: false });
        return EMPTY;
      })
    );
  }

  getArchiveById(id: string): Observable<FileArchiveWithMetrics | undefined> {
    if (!id) return of(undefined);

    return this.getArchivesByIds([id]).pipe(
      map((archives) => archives[0])
    );
  }

  refreshMetrics(id: string): Observable<FileArchiveMetrics> {
    if (!id) return EMPTY;

    return this.api.getMetrics(id).pipe(
      tap((metrics) => {
        const currentArchives = this.#state().archives;

        // Проверяем, есть ли вообще такой файловый архив в стейте
        const archiveExists = currentArchives.some(archive => archive.id === id);
        if (!archiveExists) return;

        // Создаем абсолютно новый массив, заменив в нем только один архив
        const updatedArchives = currentArchives.map((archive) =>
          archive.id === id
            ? { ...archive, metrics } // Обновляем метрики иммутабельно
            : archive                 // Остальные оставляем как есть
        );

        // Обновляем состояние правильным массивом
        this.#patch({ archives: updatedArchives });
      }),
      catchError((error: Error) => {
        this.#patch({ error: error.message });
        return EMPTY;
      }),
      finalize(() => this.#patch({ loading: false })),
    );
  }

  #patch(part: Partial<FileArchivesState>): void {
    this.#state.update((state) => ({ ...state, ...part }));
  }
}
