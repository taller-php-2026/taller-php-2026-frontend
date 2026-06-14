import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { LiveKitTokenResponse } from 'app/models/livekit.model';

@Injectable({ providedIn: 'root' })
export class LiveKitService {
  private http = inject(HttpClient);

  generarTokenReserva(idReserva: number): Observable<LiveKitTokenResponse> {
    return this.http.post<LiveKitTokenResponse>(
      `${environment.apiUrl}/reservas/${idReserva}/livekit/token`,
      {},
    );
  }
}
