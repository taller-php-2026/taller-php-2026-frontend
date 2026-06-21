import { Injectable, inject } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { AuthService } from './auth.service';

import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class EchoService {
  private authService = inject(AuthService);
  private echoInstance: Echo<any> | null = null;

  constructor() {
    // Reverb requires Pusher on the window object
    (window as any).Pusher = Pusher;
  }

  getEcho(): Echo<any> {
    if (this.echoInstance) {
      return this.echoInstance;
    }

    const token = this.authService.getToken();
    const isProd = environment.production;
    const hostname = window.location.hostname;

    this.echoInstance = new Echo({
      broadcaster: 'reverb',
      key: 'oyojr5fjueiwm9uagyyq', // From .env
      wsHost: isProd ? hostname : 'localhost',
      wsPort: isProd ? 443 : 8081,
      wssPort: isProd ? 443 : 8081,
      forceTLS: isProd,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: isProd
        ? `${environment.apiUrl}/broadcasting/auth`
        : 'http://localhost:8080/api/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    return this.echoInstance;
  }

  disconnect(): void {
    if (this.echoInstance) {
      this.echoInstance.disconnect();
      this.echoInstance = null;
    }
  }
}
