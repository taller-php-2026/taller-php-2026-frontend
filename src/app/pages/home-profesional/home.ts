import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ServicesService } from 'app/services/services.service';
import { Service } from 'app/models/service.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  protected authService = inject(AuthService);

  private router = inject(Router);

  // Fecha del día en formato amigable
  todayDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Datos mock para los próximos turnos inspirados en Stitch
  upcomingTurns = [
    {
      id: 1,
      clientName: 'María García',
      service: 'Limpieza Facial Profunda',
      time: '14:30',
      status: 'Confirmado',
      clientPicture:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAq2-N-8rFt85xxPz4LHjMgNjGDd_WKl0WiEzRtAzAUgl3cUQkYS0gDh4EKExGJjOy_2ihVYFHbnEfCWPIdYwaVjedDpkx-a4mlsdDpKtSHayGqP3j5HH2AzS8R-8Ih4wpncIjLRxFAOAJ0dw81TVf59HTFteuyyXkfAGZU2k3Ducan339pL88iA4EA0pOFpph0PG0sngEXs8LM8fSsEg6QCQkl7L4KCrs6X7wJYuG6SenHe8K0ETmc0eac_oiSnx1VNV24gfljX32P',
    },
    {
      id: 2,
      clientName: 'Lucía Torres',
      service: 'Manicuría Soft Gel',
      time: '15:15',
      status: 'Pendiente',
      clientPicture:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAFaD15gjw_knRM-gWHQxu5JMl_Bq3ZOJlJddC1tnKICpdZk3DKP-GRn78FQAjbT7aL1g0Ipy4LjCF50w_9ly5HAuzCPpx53jjJbYBkiBDeAM4pyVxBPLyRidEyhuVBqARwxPg_LsfxYnOTt_P9A_oiepn2yA9g1ArkeyPhzf4XGdiVhahzy74JS0TO6KD2Pjd3jb7SwS7yFwlYkFqOB8sYcGTmrDJAnCucojKMnR49TcofaG6VmJr8fz99tDBZfvgUuHwUq3lonukC',
    },
    {
      id: 3,
      clientName: 'Guzmán Perera',
      service: 'Perfilado de Barba',
      time: '16:00',
      status: 'Confirmado',
      clientPicture: '',
    },
  ];

  ngOnInit() {
    // Si no está autenticado, redirigir al login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  goToConfigurarServicios() {
    this.router.navigate(['/configurar-servicios']);
  }
}
