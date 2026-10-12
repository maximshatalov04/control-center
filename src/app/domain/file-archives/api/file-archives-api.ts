import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileArchiveInfo, FileArchiveMetrics } from '../models/file-archive-info';
import { APP_CONFIG } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FileArchivesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${APP_CONFIG.apiUrl}/api/file-archives`;

  getAll(): Observable<FileArchiveInfo[]> {
    return this.http.get<FileArchiveInfo[]>(this.baseUrl);
  }

  getById(id: string): Observable<FileArchiveInfo> {
    return this.http.get<FileArchiveInfo>(`${this.baseUrl}/${id}`);
  }

  getByDatabase(databaseId: string): Observable<FileArchiveInfo[]> {
    return this.http.get<FileArchiveInfo[]>(`${this.baseUrl}`, {
      params: { databaseId },
    });
  }

  getMetrics(id: string): Observable<FileArchiveMetrics> {
    return this.http.get<FileArchiveMetrics>(`${this.baseUrl}/${id}/metrics`);
  }
}
