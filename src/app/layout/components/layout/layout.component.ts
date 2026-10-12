import { Component, inject, signal } from '@angular/core';
import { TreeViewComponent } from '../../../domain/control-center/components/tree-view/tree-view.component';
import { Entity } from '../../../shared/models/entity';
import { ToastComponent } from '../../../ui/components/toast/toast';
import { TreeSelection } from '../../../domain/control-center/interfaces/tree-selection';
import { RouterOutlet, Router, RouterLinkActive, RouterLink } from '@angular/router';

@Component({
  imports: [TreeViewComponent, ToastComponent, RouterOutlet, RouterLinkActive, RouterLink],
  selector: 'app-layout',
  styleUrl: './layout.component.scss',
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  readonly selectedObject = signal<Entity | undefined>(undefined);
  readonly #router = inject(Router);

  onObjectSelected(selection: TreeSelection | undefined) {
    if (!selection) {
      this.selectedObject.set(undefined);
      void this.#router.navigate(['/info']);
      return;
    }

    const { entity, parentIds } = selection;
    this.selectedObject.set(entity);

    switch (entity.type) {
      case 'server':
        // parentIds = []
        void this.#router.navigate(['/info', 'server', entity.id]);
        break;

      case 'database':
        // parentIds = [serverId]
        void this.#router.navigate([
          '/info',
          'server', parentIds[0],
          'database', entity.id,
        ]);
        break;

      case 'archive':
        // parentIds = [serverId, databaseId]
        void this.#router.navigate([
          '/info',
          'server', parentIds[0],
          'database', parentIds[1],
          'archive', entity.id,
        ]);
        break;
    }
  }
}
