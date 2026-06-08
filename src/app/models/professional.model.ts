export interface Professional {
  idUsuario: number;
  nombreNegocio?: string;
  descripcion?: string;
  ratingPromedio?: number;
  usuario?: {
    idUsuario: number;
    nombre: string;
    email: string;
    telefono?: string;
    imagenPerfilUrl?: string;
    imagenPerfilPublicId?: string;
  };
}
