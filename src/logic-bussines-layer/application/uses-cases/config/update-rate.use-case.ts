// Creamos los caso de uso para actualizar la tasa
import type { ConfigRepository } from "@/logic-bussines-layer/domain/repositories/config.repository";

export const updateRateUseCase = (configRepository: ConfigRepository) => {
  return async (rate: number): Promise<void> => {
    if (rate <= 0 || isNaN(rate)) throw new Error('La tasa debe ser un número mayor a cero.');
    return await configRepository.updateDollarRate(rate);
  };
};