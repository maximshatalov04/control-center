import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../../environments/environment';
import { Server } from '../../../shared/models/server';

@Injectable({ providedIn: 'root' })
export class ServersTreeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${APP_CONFIG.apiUrl}/api/servers-tree`;

  getAll(): Observable<Server[]> {
    return this.http.get<Server[]>(this.baseUrl);
  }
}
