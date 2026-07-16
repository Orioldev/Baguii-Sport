// caso de uso para suscribirse a sus cambios.
import type { ConfigRepository } from "@/logic-bussines-layer/domain/repositories/config.repository";

export const subscribeRateUseCase = (configRepository: ConfigRepository) => {
  return (onUpdate: (rate: number) => void) => {
    return configRepository.subscribeToRate(onUpdate);
  };
};