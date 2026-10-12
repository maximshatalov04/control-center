import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  standalone: true,
})
export class ButtonComponent {
  readonly btnClick = output<void>();

  readonly label = input.required<string>();
  readonly type = input<'outline' | 'primary'>('outline');
  readonly size = input<'sm' | 'md'>('md');
}