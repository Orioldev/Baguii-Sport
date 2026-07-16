import type { AuthRepository } from '../../domain/repositories/auth.repository';

export const logoutUseCase = (authRepository: AuthRepository) => {
  return async (): Promise<void> => {
    return await authRepository.logout();
  };
};