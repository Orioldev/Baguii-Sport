import type { AuthRepository } from '@/logic-bussines-layer/domain/repositories/auth.repository';
import type { User } from '../../domain/models/user.model';

// login credential recibe un email y una contrasena para iniciar sesion
export interface LoginCredentials {
  email: string;
  password: string;
}

export const loginUseCase = (authRepository: AuthRepository) => {
  return async (credentials: LoginCredentials): Promise<User> => {
    // Regla de negocio de validación previa básica
    if (!credentials.email || !credentials.password) {
      throw new Error('El correo electrónico y la contraseña son requeridos.');
    }
    
    // Ejecuta el contrato
    return await authRepository.login(credentials);
  };
};