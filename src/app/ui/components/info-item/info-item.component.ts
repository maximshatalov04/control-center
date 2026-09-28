import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-info-item',
  styleUrl: './info-item.component.scss',
  templateUrl: './info-item.component.html',
  host: {
    '[class.info-item--full]': 'isFull()',
    '[class.info-item--column]': 'direction()==="column"',
  }
})
export class InfoItemComponent {
  readonly label = input.required<string>();
  readonly isFull = input<boolean>(false);
  readonly direction = input<string>('column');
  readonly isCustom = input<boolean>(false);
}
