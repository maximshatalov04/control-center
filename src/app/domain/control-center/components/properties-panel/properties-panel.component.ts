import { Component, input } from '@angular/core';
import { Entity } from '../../models/entity';

@Component({
  imports: [],
  selector: 'app-properties-panel',
  styleUrl: './properties-panel.component.scss',
  templateUrl: './properties-panel.component.html',
})
export class PropertiesPanelComponent {
  readonly selectedObject = input<Entity>();

}
