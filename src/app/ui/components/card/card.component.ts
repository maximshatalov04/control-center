import { Component, input } from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  imports: [BadgeComponent]
})
export class CardComponent {
  readonly headerTitle = input<string>();
  readonly headerBadge = input<string>();
  readonly headerBadgeColor = input<string>();
  readonly active = input<boolean>(false);
}
