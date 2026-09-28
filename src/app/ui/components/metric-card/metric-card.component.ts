import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss'
})
export class MetricCardComponent {
  readonly header = input.required<string>();
  readonly value = input.required<string | number>();
  readonly isLarge = input<boolean>(false);
}
