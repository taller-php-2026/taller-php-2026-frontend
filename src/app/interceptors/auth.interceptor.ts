import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo interceptar requests al backend propio
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Clonar sin tocar Content-Type (necesario para multipart/form-data)
  const backendReq = req.clone({
    setHeaders: headers,
  });

  return next(backendReq);
};
