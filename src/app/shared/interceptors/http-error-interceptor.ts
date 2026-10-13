import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, delay, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { APP_CONFIG } from '../../../environments/environment';

export const HttpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const toastService = inject(ToastService);

  const pipe = next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Неизвестная ошибка API';

      if (error.error instanceof ErrorEvent) {
        message = `Клиентская ошибка: ${error.error.message}`;
      } else {
        message = error.status
          ? `Серверная ошибка: ${error.status} ${error.message}`
          : `Серверная ошибка: ${error.message}`;
      }

      // Возвращаем поток, который вызывает show(), а затем завершается.
      return toastService.show(message, 'error').pipe(
        // После показа тоста продолжаем поток с ошибкой для потребителя
        () => throwError(() => new Error(message)),
      );
    }),
  );

  if (!APP_CONFIG.production) {
    return pipe.pipe(delay(Math.random() * 700))
  }
  else {
    return pipe;
  }
};
