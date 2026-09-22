import { Component, signal } from '@angular/core';
import { TreeViewComponent } from '../../../domain/control-center/components/tree-view/tree-view.component';
import { Entity } from '../../../shared/models/entity';
import { ServerDashboardComponent } from '../../../domain/servers/components/server-dashboard/server-dashboard.component';
import { DatabaseDashboardComponent } from '../../../domain/databases/components/database-dashboard/database-dashboard.component';
import { FileArchiveDashboardComponent } from '../../../domain/file-archives/components/file-archive-dashboard/file-archive-dashboard.component';

@Component({
  imports: [TreeViewComponent, ServerDashboardComponent, DatabaseDashboardComponent, FileArchiveDashboardComponent],
  selector: 'app-layout',
  styleUrl: './layout.component.scss',
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  readonly selectedObject = signal<Entity | undefined>(undefined);

  onObjectSelected(entity: Entity | undefined) {
    this.selectedObject.set(entity);
  }
}
