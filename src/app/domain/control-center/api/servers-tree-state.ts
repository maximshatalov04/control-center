import { Injectable, inject, signal, computed } from '@angular/core';
import { catchError, EMPTY, finalize, Observable, tap } from 'rxjs';
import { ServersTreeApiService } from './servers-tree-api';
import { ServersTreeState } from '../models/servers-tree-state';
import { Server } from '../../../shared/models/server';

@Injectable({ providedIn: 'root' })
export class ServersTreeStateService {
  private readonly api = inject(ServersTreeApiService);
  readonly #state = signal<ServersTreeState>({
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
  loadAll(): Observable<Server[]> {
    this.#patch({ loading: true, error: undefined });

    return this.api.getAll().pipe(
      tap((servers) => this.#patch({ servers })),
      catchError((error: Error): Observable<Server[]> => {
        this.#patch({ error: error.message });
        return EMPTY;
      }),
      finalize(() => this.#patch({ loading: false })),
    );
  }

  #patch(part: Partial<ServersTreeState>): void {
    this.#state.update((state) => ({ ...state, ...part }));
  }
}
