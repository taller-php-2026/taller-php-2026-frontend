import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-usuarios.component.html',
})
export class GestionarUsuariosComponent implements OnInit {
  private adminService = inject(AdminService);
  authService = inject(AuthService);

  // Estados de carga e informacion.
  usuarios = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  // Control de modal de creacion de administrador.
  modalAbierto = signal<boolean>(false);

  // Campos del formulario para nuevo administrador.
  nuevoAdmin = {
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    rol: 'administrador'
  };

  // Error específico de la creación.
  crearError = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // Cargar lista de usuarios desde el backend.
  cargarUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios.set(res.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar los usuarios del sistema.');
        this.loading.set(false);
      }
    });
  }

  // Abrir modal de creacion de administrador.
  abrirModal(): void {
    this.nuevoAdmin = {
      nombre: '',
      email: '',
      telefono: '',
      password: '',
      rol: 'administrador'
    };
    this.crearError.set(null);
    this.modalAbierto.set(true);
  }

  // Cerrar modal de creacion.
  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  // Registrar un nuevo usuario administrador.
  guardarAdministrador(): void {
    this.crearError.set(null);
    this.successMsg.set(null);

    if (!this.nuevoAdmin.nombre || !this.nuevoAdmin.email || !this.nuevoAdmin.password || !this.nuevoAdmin.telefono) {
      this.crearError.set('Todos los campos son obligatorios.');
      return;
    }

    this.adminService.crearUsuario(this.nuevoAdmin).subscribe({
      next: () => {
        this.successMsg.set('Administrador registrado correctamente.');
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error(err);
        this.crearError.set(err?.error?.message || 'Error al intentar registrar el administrador.');
      }
    });
  }

  // Eliminar un usuario del sistema (excepto a si mismo).
  eliminarUsuario(id: number, nombre: string): void {
    const selfId = this.authService.currentUser()?.idUsuario;
    if (id === selfId) {
      alert('No podés eliminarte a vos mismo.');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) {
      this.loading.set(true);
      this.successMsg.set(null);
      this.error.set(null);

      this.adminService.eliminarUsuario(id).subscribe({
        next: () => {
          this.successMsg.set('Usuario eliminado correctamente.');
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error(err);
          this.error.set(err?.error?.message || 'Error al intentar eliminar el usuario.');
          this.loading.set(false);
        }
      });
    }
  }

  // Determinar badges de tipo o rol principal.
  getRolesBadge(user: any): string {
    if (user.roles?.includes('administrador')) return 'Administrador';
    if (user.roles?.includes('profesional')) return 'Profesional';
    return 'Cliente';
  }
}
