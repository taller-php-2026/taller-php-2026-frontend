import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ScheduleResponse } from 'app/models/schedule.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getSlots(idProfesional: number, fecha: string, idServicio: number): Observable<ScheduleResponse> {
    return this.http.get<ScheduleResponse>(
      `${this.apiUrl}/profesionales/${idProfesional}/disponibilidad?fecha=${fecha}&idServicio=${idServicio}`,
    );
  }
}
