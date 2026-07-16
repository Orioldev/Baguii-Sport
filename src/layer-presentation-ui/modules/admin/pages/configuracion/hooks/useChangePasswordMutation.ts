import { useMutation } from '@tanstack/react-query';
import { AuthRepositoryImpl } from '@/persistence-layer/repositories/auth.repository.impl';
import { changePasswordUseCase } from '@/logic-bussines-layer/application/uses-cases/change-password.use-case';

const authRepository = new AuthRepositoryImpl();
const changePasswordExecute = changePasswordUseCase(authRepository);

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: ({ newPassword, repeatPassword }: { newPassword: string; repeatPassword: string }) =>
      changePasswordExecute(newPassword, repeatPassword),
    onError: (error: any) => {
      console.error('Error al cambiar la contraseña:', error.message);
    },
  });
};