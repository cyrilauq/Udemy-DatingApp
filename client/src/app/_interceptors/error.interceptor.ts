import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastrService = inject(ToastrService);

  return next(req).pipe(
    catchError((httpError) => {
      if (httpError) {
        switch (httpError.status) {
          case 400:
            const validationErrors = httpError.error.errors;
            if(validationErrors) {
              throw Object.keys(validationErrors).map(error => validationErrors[error]).flat();
            } else {
              toastrService.error(httpError.error, httpError.status);
            }
            break;
          case 401:
            toastrService.error("Unauthorized", httpError.status);
            break;
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras: NavigationExtras = {
              state: { error: httpError.error }
            };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            toastrService.error("Something unexpected went wrong");
            break;
        }
      }
      throw httpError;
    })
  );
};
