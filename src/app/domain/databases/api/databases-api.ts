import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatabaseInfo, DatabaseMetrics } from '../models/database-info';
import { APP_CONFIG } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DatabasesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${APP_CONFIG.apiUrl}/api/databases`;

  getAll(): Observable<DatabaseInfo[]> {
    return this.http.get<DatabaseInfo[]>(this.baseUrl);
  }

  getById(id: string): Observable<DatabaseInfo> {
    return this.http.get<DatabaseInfo>(`${this.baseUrl}/${id}`);
  }

  getByServer(serverId: string): Observable<DatabaseInfo[]> {
    return this.http.get<DatabaseInfo[]>(`${this.baseUrl}`, {
      params: { serverId },
    });
  }

  getMetrics(id: string): Observable<DatabaseMetrics> {
    return this.http.get<DatabaseMetrics>(`${this.baseUrl}/${id}/metrics`);
  }
}
