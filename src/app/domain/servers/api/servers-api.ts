import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerInfo, ServerMetrics } from '../models/server-info';
import { APP_CONFIG } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${APP_CONFIG.apiUrl}/api/servers`;

  getAll(): Observable<ServerInfo[]> {
    return this.http.get<ServerInfo[]>(this.baseUrl);
  }

  getById(id: string): Observable<ServerInfo> {
    return this.http.get<ServerInfo>(`${this.baseUrl}/${id}`);
  }

  getMetrics(id: string): Observable<ServerMetrics> {
    return this.http.get<ServerMetrics>(`${this.baseUrl}/${id}/metrics`);
  }
}
