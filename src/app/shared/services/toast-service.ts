import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, timer } from 'rxjs';
import { Toast } from '../../ui/components/toast/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts$ = new BehaviorSubject<Toast[]>([]);
  private idCounter = 0;

  readonly toasts$: Observable<Toast[]> = this._toasts$.asObservable();

  show(message: string, type: Toast['type'] = 'info'): Observable<void> {
    const id = this.idCounter++;
    this._toasts$.next([...this._toasts$.value, { id, message, type }]);

    return timer(1500).pipe(
      switchMap(() => this.dismiss(id)),
    );
  }

  dismiss(id: number): Observable<void> {
    this._toasts$.next(this._toasts$.value.filter(t => t.id !== id));
    return of(void 0);
  }
}
