import type { User } from '../models/user.model';
import type { LoginCredentials } from '@/logic-bussines-layer/application/uses-cases/login.use-case';

// El contrato o interfaz que define qué debe hacer cualquier proveedor de autenticación que use la app.

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<User>;
  sendPasswordReset(email: string): Promise<void>;
  logout(): Promise<void>; 
  onAuthStateChanged(onUserChange: (user: any) => void): () => void;

  // Nuevo, para "Seguridad y acceso":
  // Confirma la contraseña actual del usuario autenticado (además, deja la sesión
  // "recién autenticada" ante Firebase, requisito para poder llamar a changePassword).
  reauthenticate(email: string, currentPassword: string): Promise<void>;
  // Cambia la contraseña de autenticación del usuario ya autenticado.
  changePassword(newPassword: string): Promise<void>;
}