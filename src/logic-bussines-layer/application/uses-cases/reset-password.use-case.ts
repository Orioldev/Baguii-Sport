//import type { AuthRepository } from "@/logic-bussines-layer/domain/repositories/auth.repository";

import type { AuthRepository } from "@/logic-bussines-layer/domain/repositories/auth.repository";


export const resetPasswordUseCase = (authRepository: AuthRepository) => {
  return async (email: string): Promise<void> => {
    if (!email) throw new Error('El correo es obligatorio.');
    return await authRepository.sendPasswordReset(email);
  };
};