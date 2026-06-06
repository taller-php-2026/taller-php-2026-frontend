import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from 'app/models/service.model';

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private apiUrl = environment.apiUrl + '/servicios';

  constructor(private http: HttpClient) {}

  getAllServices(): Observable<{ data: Service[] }> {
    return this.http.get<{ data: Service[] }>(`${this.apiUrl}`);
  }

  getServiceById(serviceId: string): Observable<{ data: Service }> {
    return this.http.get<{ data: Service }>(`${this.apiUrl}/${serviceId}`);
  }

  getProfessionalsByService(serviceId: string): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/${serviceId}/profesionales`);
  }
}
