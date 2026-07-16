import type { ProductRepository } from '../../domain/repositories/product.repository';
import type { Product } from '@/logic-bussines-layer/domain/models/product.model';
import { z } from 'zod';

export const CreateProductSchema = z.object({
  title: z.string().min(3, "El nombre del calzado debe tener al menos 3 caracteres"),
  description: z.string().min(5, "La descripción debe ser más detallada"),
  minStock: z.number().min(1, "El stock mínimo global debe ser al menos 1 par"),
  image: z.string().default(""),
  sizes: z.array(z.object({
    size: z.string().min(1, "Talla requerida"),
    price: z.number().positive("El precio debe ser un número mayor a 0"),
    qty: z.number().min(0, "La cantidad no puede ser negativa"),
  })).min(1, "Debe añadir al menos una combinación de talla y precio"),
});

// Definimos un tipo limpio derivable de Zod para la entrada de datos
type CreateProductInput = z.infer<typeof CreateProductSchema>;

export class CreateProductUseCase {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  // Usamos el tipo directo en lugar del Omit embebido en línea para solucionar el error 1294
  async execute(input: CreateProductInput, imageFile: File | null): Promise<Product> {
    const validatedData = CreateProductSchema.parse(input);
    return await this.productRepository.create(validatedData, imageFile);
  }
}