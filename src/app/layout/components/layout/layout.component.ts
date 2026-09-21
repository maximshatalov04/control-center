import { Component, signal } from '@angular/core';
import { TreeViewComponent } from '../../../domain/control-center/components/tree-view/tree-view.component';
import { Entity } from '../../../domain/control-center/models/entity';
import { PropertiesPanelComponent } from '../../../domain/control-center/components/properties-panel/properties-panel.component';

@Component({
  imports: [TreeViewComponent, PropertiesPanelComponent],
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
