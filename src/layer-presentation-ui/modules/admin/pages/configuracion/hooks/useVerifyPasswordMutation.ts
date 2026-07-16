import { useMutation } from '@tanstack/react-query';
import { AuthRepositoryImpl } from '@/persistence-layer/repositories/auth.repository.impl';
import { verifyCurrentPasswordUseCase } from '@/logic-bussines-layer/application/uses-cases/verify-current-password.use-case';

const authRepository = new AuthRepositoryImpl();
const verifyExecute = verifyCurrentPasswordUseCase(authRepository);

export const useVerifyPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ email, currentPassword }: { email: string; currentPassword: string }) =>
      verifyExecute(email, currentPassword),
    onError: (error: any) => {
      console.error('Error al verificar la contraseña actual:', error.message);
    },
  });
};