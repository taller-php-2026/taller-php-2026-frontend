import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo interceptar requests al backend propio
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  if (!token) {
    return next(req);
  }

  // Clonar sin tocar Content-Type (necesario para multipart/form-data)
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  return next(authReq);
};
