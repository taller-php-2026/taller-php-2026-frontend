import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilteredService, Service } from 'app/models/service.model';

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

  getFilteredServices(filtros: FilteredService): Observable<{ data: Service[]; meta: any }> {
    const params = new HttpParams({ fromObject: filtros as any });
    return this.http.get<{ data: Service[]; meta: any }>(`${this.apiUrl}/buscar`, { params });
  }
}
