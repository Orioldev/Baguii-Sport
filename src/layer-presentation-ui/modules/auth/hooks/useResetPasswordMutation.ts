import { useMutation } from '@tanstack/react-query';
import { AuthRepositoryImpl } from '@/persistence-layer/repositories/auth.repository.impl';
import { resetPasswordUseCase } from '@/logic-bussines-layer/application/uses-cases/reset-password.use-case';

// Creamos un hook independiente con TanStack Query para manejar esta acción asíncrona por separado de la del Login

const authRepository = new AuthRepositoryImpl();
const resetPasswordExecute = resetPasswordUseCase(authRepository);

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (email: string) => resetPasswordExecute(email),
    onSuccess: () => {
      // Aquí podrías disparar una alerta visual de éxito si quieres
      console.log('Correo enviado con éxito');
    },
    onError: (error: any) => {
      console.error(error.message);
    },
  });
};