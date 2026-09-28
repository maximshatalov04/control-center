import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.scss'
})
export class MetricCardComponent {
  readonly header = input.required<string>();
  readonly content = input<string | number | null>(null);
  readonly isLarge = input<boolean>(false);
}
