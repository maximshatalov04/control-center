import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-empty-state',
  styleUrl: './empty-state.component.scss',
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly message = input<string | undefined>(undefined);
}
