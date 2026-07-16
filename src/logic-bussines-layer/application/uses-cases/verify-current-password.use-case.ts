
import type { AuthRepository } from '@/logic-bussines-layer/domain/repositories/auth.repository';

export const verifyCurrentPasswordUseCase = (authRepository: AuthRepository) => {
  return async (email: string, currentPassword: string): Promise<void> => {
    if (!currentPassword) {
      throw new Error('Debes ingresar tu contraseña actual.');
    }
    return await authRepository.reauthenticate(email, currentPassword);
  };
};