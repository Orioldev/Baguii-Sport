import { db } from '../API/firebase.config';
import { supabase } from '../API/supabase.config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { IProductRepository } from '@/logic-bussines-layer/domain/repositories/product.repository';
import type { Product } from '@/logic-bussines-layer/domain/models/product.model';

export class ProductRepositoryImpl implements IProductRepository {
  private productsCollection = collection(db, 'products');
  private bucketName = 'bagui-products';

  private async uploadImage(file: File): Promise<string> {
    // 1. Extraemos la extensión de forma segura
    const fileExt = file.name.split('.').pop();
    
    // 2. Generamos un nombre único plano (sin subcarpetas como 'calzados/') 
    // para evitar el error "Invalid path specified in request URL"
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // 3. Subimos directamente el archivo usando el fileName limpio
    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error("❌ ERROR DETALLADO DE SUPABASE:", error);
      throw new Error(`Error en Supabase Storage: ${error.message}`);
    }

    // 4. Solicitamos la URL pública usando el mismo fileName limpio
    const { data } = supabase.storage.from(this.bucketName).getPublicUrl(fileName);
    return data.publicUrl;
  }

  // 🟢 Auxiliar compartido para no duplicar el mapeo entre getAll() y subscribeAll()
  private mapDocToProduct(docSnap: { id: string; data: () => any }): Product {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      description: data.description,
      image: data.image,
      minStock: data.minStock,
      createdAt: data.createdAt?.toDate() || new Date(),
      sizes: data.sizes || [],
    } as Product;
  }

  async getAll(): Promise<Product[]> {
    const q = query(this.productsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => this.mapDocToProduct(docSnap));
  }

  // 🟢 Nuevo: suscripción en tiempo real al inventario completo
  subscribeAll(onUpdate: (products: Product[]) => void): () => void {
    const q = query(this.productsCollection, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      onUpdate(snapshot.docs.map((docSnap) => this.mapDocToProduct(docSnap)));
    });
  }

  async create(product: Omit<Product, 'id' | 'createdAt'>, imageFile: File | null): Promise<Product> {
    let imageUrl = product.image || 'https://placehold.co/600x450?text=Calzado+Bagui';

    if (imageFile) {
      imageUrl = await this.uploadImage(imageFile);
    }

    const docRef = await addDoc(this.productsCollection, {
      ...product,
      image: imageUrl,
      createdAt: new Date(),
    });

    return {
      id: docRef.id,
      ...product,
      image: imageUrl,
      createdAt: new Date(),
    };
  }

  // 2. UPDATE (ya NO borra la imagen anterior de Supabase: las ventas históricas
  // guardan su propia copia congelada de esa URL en `Sale.productImage`, así que
  // borrar el archivo viejo rompería el historial de ventas que la referencian).
  async update(id: string, product: Partial<Product>, imageFile: File | null): Promise<void> {
    const docRef = doc(db, 'products', id);
    const updateData = { ...product };

    if (imageFile) {
      // Subimos la nueva imagen recién seleccionada; la anterior se deja intacta en Supabase.
      updateData.image = await this.uploadImage(imageFile);
    }

    await updateDoc(docRef, updateData);
  }

  // 3. DELETE (ya NO borra la imagen del producto en Supabase, por la misma razón
  // que update(): ventas históricas pueden seguir apuntando a esa misma imagen).
  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  }
}