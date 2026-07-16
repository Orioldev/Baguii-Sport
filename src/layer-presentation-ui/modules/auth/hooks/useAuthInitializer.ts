import { useEffect } from 'react';
import { AuthRepositoryImpl } from '@/persistence-layer/repositories/auth.repository.impl';
import { useAuthStore } from './useAuthStore';

const authRepository = new AuthRepositoryImpl();

export const useAuthInitializer = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitializing = useAuthStore((state) => state.setInitializing);

  useEffect(() => {
    // Escuchamos a Firebase en tiempo real
    const unsubscribe = authRepository.onAuthStateChanged((user) => {
      if (user) {
        setUser(user); // Guarda al usuario y apaga isInitializing
      } else {
        setInitializing(false); // No hay usuario, pero Firebase ya terminó de buscar
      }
    });

    return () => unsubscribe();
  }, [setUser, setInitializing]);
};