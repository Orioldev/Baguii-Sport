import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { AuthRepositoryImpl } from '@/persistence-layer/repositories/auth.repository.impl';
import { logoutUseCase } from '@/logic-bussines-layer/application/uses-cases/logout.use-case';
import { useAuthStore } from './useAuthStore';

const authRepository = new AuthRepositoryImpl();
const logoutExecute = logoutUseCase(authRepository);

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const logoutStore = useAuthStore((state) => state.logout); // Acción de Zustand

  return useMutation({
    mutationFn: () => logoutExecute(),
    onSuccess: () => {
      // 1. Limpia Zustand y remueve automáticamente los datos del localStorage
      logoutStore();
      
      // 2. Redirige al dueño a la raíz del Login eliminando el historial
      navigate('/', { replace: true });
    },
    onError: (error: any) => {
      console.error('Error al cerrar sesión:', error.message);
    },
  });
};