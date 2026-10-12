import { Component } from '@angular/core';
import { EmptyStateComponent } from '../../../../layout/components/empty-state/empty-state.component';

@Component({
  imports: [EmptyStateComponent],
  selector: 'app-files-dashboard',
  styleUrl: './files-dashboard.component.scss',
  templateUrl: './files-dashboard.component.html',
})
export class FilesDashboardComponent {
}
