import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/components/layout/layout.component';
import { DatabaseDashboardComponent } from './domain/databases/components/database-dashboard/database-dashboard.component';
import { FileArchiveDashboardComponent } from './domain/file-archives/components/file-archive-dashboard/file-archive-dashboard.component';
import { ServerDashboardComponent } from './domain/servers/components/server-dashboard/server-dashboard.component';
import { EmptyStateComponent } from './layout/components/empty-state/empty-state.component';
import { FilesDashboardComponent } from './domain/files/components/files-dashboard/files-dashboard.component';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'info',
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      // /info — вкладка «Информация»
      {
        path: 'info',
        children: [
          { path: '', component: EmptyStateComponent },
          { path: 'server/:serverId', component: ServerDashboardComponent },
          { path: 'server/:serverId/database/:databaseId', component: DatabaseDashboardComponent },
          { path: 'server/:serverId/database/:databaseId/archive/:archiveId', component: FileArchiveDashboardComponent },
        ],
      },
      //files — вкладка «Файлы»
      {
        path: 'files',
        component: FilesDashboardComponent,
      },
    ],
  },
  { path: '**', redirectTo: 'info' },
];