
import type { AuthRepository } from '@/logic-bussines-layer/domain/repositories/auth.repository';

export const changePasswordUseCase = (authRepository: AuthRepository) => {
  return async (newPassword: string, repeatPassword: string): Promise<void> => {
    // Reglas de negocio: se validan aquí también (no solo en la UI), para que
    // cualquier consumidor futuro del caso de uso quede protegido igual.
    if (newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
    }
    if (newPassword !== repeatPassword) {
      throw new Error('Las contraseñas no coinciden.');
    }

    return await authRepository.changePassword(newPassword);
  };
};