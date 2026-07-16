import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ConfigRepositoryImpl } from '@/persistence-layer/repositories/config.repository.impl';
import { updateRateUseCase } from '@/logic-bussines-layer/application/uses-cases/config/update-rate.use-case';
import { subscribeRateUseCase } from '@/logic-bussines-layer/application/uses-cases/config/suscribe-rate.use-case';
import { useConfigStore } from './useConfigStore';

// Hook de Inicialización y Actualización de Tasa: Para no sobrecargar los componentes visuales, creamos un hook que maneja la suscripción
//  en tiempo real a Firebase y expone la mutación para guardar el nuevo valor a través de TanStack Query.

const configRepository = new ConfigRepositoryImpl();
const updateRateExecute = updateRateUseCase(configRepository);
const subscribeRateExecute = subscribeRateUseCase(configRepository);

export const useDollarRate = () => {
  const { rate, setRate } = useConfigStore();

  // 1. Nos suscribimos a los cambios en tiempo real de Firebase al montar el hook
  useEffect(() => {
    const unsubscribe = subscribeRateExecute((liveRate) => {
      setRate(liveRate);
    });
    return () => unsubscribe(); // Limpieza al desmontar
  }, [setRate]);

  // 2. Mutación para actualizar la tasa desde el popover
  const mutation = useMutation({
    mutationFn: (newRate: number) => updateRateExecute(newRate),
    onError: (error: any) => {
      console.error('Error al actualizar la tasa:', error.message);
    },
  });

  return {
    rate,
    updateRate: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};