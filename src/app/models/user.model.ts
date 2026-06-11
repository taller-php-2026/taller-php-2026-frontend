export interface UserProfile {
  idUsuario?: number;
  name: string;
  email: string;
  picture: string;
  type?: 'cliente' | 'profesional';
  telefono?: string;
  imagenPerfilUrl?: string;
  imagenPerfilPublicId?: string;
}

export interface BackendUsuario {
  idUsuario: number;
  nombre: string;
  email: string;
  telefono?: string;
  activo?: boolean;
  roles?: string[];
  tipoPrincipal?: 'cliente' | 'profesional' | null;
  imagenPerfilUrl?: string;
  imagenPerfilPublicId?: string;
  profesional?: {
    idUsuario?: number;
    nombreNegocio?: string;
    descripcion?: string;
  } | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: BackendUsuario;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  password_confirmation: string;
  telefono: string;
  tipo: 'cliente' | 'profesional';
  nombreNegocio?: string;
  descripcion?: string;
}

export interface CompletarPerfilPayload {
  tipo: 'cliente' | 'profesional';
  telefono: string;
  nombreNegocio?: string;
  descripcion?: string;
}
