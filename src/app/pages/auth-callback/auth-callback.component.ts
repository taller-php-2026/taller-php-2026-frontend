import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BackendUsuario } from '../../models/user.model';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background">
      <div class="flex flex-col items-center gap-md">
        <span class="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></span>
        <p class="font-body-md text-on-surface-variant">Iniciando sesión...</p>
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;

    const token = params.get('token') ?? params.get('access_token');
    const idUsuario = params.get('idUsuario');
    const nombre = params.get('nombre');
    const email = params.get('email');
    const tipoPrincipalRaw = params.get('tipoPrincipal') ?? '';
    const tipoPrincipal =
      tipoPrincipalRaw === 'cliente' || tipoPrincipalRaw === 'profesional'
        ? tipoPrincipalRaw
        : null;
    const rolesRaw = params.get('roles');
    const roles = rolesRaw ? rolesRaw.split(',').filter((r) => r.trim() !== '') : [];
    const necesitaCompletarPerfil = params.get('necesitaCompletarPerfil') === 'true';

    if (!token || !idUsuario || !nombre || !email) {
      this.router.navigate(['/login'], { queryParams: { error: 'google_auth_failed' } });
      return;
    }

    const backendUser: BackendUsuario = {
      idUsuario: Number(idUsuario),
      nombre,
      email,
      activo: true,
      roles,
      tipoPrincipal,
    };

    if (necesitaCompletarPerfil || roles.length === 0) {
      // Usuario nuevo de Google: sesión parcial, completar perfil
      this.authService.setPartialSession(token, backendUser);
      this.router.navigate(['/elegir-tipo']);
    } else {
      // Usuario existente con rol: sesión completa
      this.authService.setSession(token, backendUser);
      this.router.navigate(['/']);
    }
  }
}
