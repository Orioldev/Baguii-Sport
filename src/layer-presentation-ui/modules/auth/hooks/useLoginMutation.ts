import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { AuthRepositoryImpl } from '@/persistence-layer/repositories/auth.repository.impl';
import { loginUseCase, type LoginCredentials } from '@/logic-bussines-layer/application/uses-cases/login.use-case';
import { useAuthStore } from './useAuthStore';

// Aquí es donde ocurre la magia de la integración. Instanciamos la implementación real del repositorio, se la pasamos al caso de uso, y envolvemos todo en un useMutation

// 1. Instanciamos la persistencia y el caso de uso
const authRepository = new AuthRepositoryImpl();
const loginExecute = loginUseCase(authRepository);

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginExecute(credentials),
    onSuccess: (user) => {
      // Guardamos el usuario en el estado global de la UI
      setUser(user);
      // Redireccionamos al dashboard de administración de Bagui Sports
      navigate('/admin');
    },
    onError: (error: any) => {
      // El error ya viene con el mensaje limpio que definimos en la persistencia
      console.error(error.message);
    },
  });
};