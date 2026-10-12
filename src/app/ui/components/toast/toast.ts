import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../../../shared/services/toast-service';

@Component({
  selector: 'app-toast-component',
  imports: [AsyncPipe],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly toasts$ = this.toastService.toasts$;

  toastTypeClass(type?: Toast['type']) {
    if (!type) return 'toast-info';
    return `toast-${type}`;
  }

  dismiss(id: number) {
    this.toastService.dismiss(id).subscribe();
  }
}

export interface Toast {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}