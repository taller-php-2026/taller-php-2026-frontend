export interface UserProfile {
  name: string;
  email: string;
  picture: string;
  type?: 'cliente' | 'profesional';
  idUsuario?: number;
}
