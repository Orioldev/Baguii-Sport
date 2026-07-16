// Definimos los métodos necesarios para leer la tasa en tiempo real y actualizarla
export interface ConfigRepository {
  getDollarRate(): Promise<number>;
  updateDollarRate(rate: number): Promise<void>;
  subscribeToRate(onUpdate: (rate: number) => void): () => void; // Para tiempo real
}