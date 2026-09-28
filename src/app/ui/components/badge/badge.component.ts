import { Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  readonly text = input.required<string>();
  readonly color = input<string>('');
  readonly small = input<boolean>(false);
}