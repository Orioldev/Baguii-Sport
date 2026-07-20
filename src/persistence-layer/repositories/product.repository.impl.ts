import { db } from '../API/firebase.config';
import { supabase } from '../API/supabase.config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, getDoc, orderBy, onSnapshot } from 'firebase/firestore';
import type { IProductRepository } from '@/logic-bussines-layer/domain/repositories/product.repository';
import type { Product } from '@/logic-bussines-layer/domain/models/product.model';

export class ProductRepositoryImpl implements IProductRepository {
  private productsCollection = collection(db, 'products');
  private bucketName = 'bagui-products';

  // Auxiliar para extraer el nombre del archivo desde su URL pública de Supabase
  private getFileNameFromUrl(url: string): string | null {
    if (!url || !url.includes(this.bucketName)) return null;

    const keyword = `/object/public/${this.bucketName}/`;
    if (url.includes(keyword)) {
      return url.split(keyword)[1];
    }

    const parts = url.split('/');
    return parts[parts.length - 1];
  }

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

  // 2. UPDATE — borra la imagen anterior de Supabase al reemplazarla. Ya es seguro:
  // las ventas ya no guardan ninguna copia de esta URL (Sale.productImage se eliminó
  // del modelo), así que ninguna venta histórica depende de que este archivo siga existiendo.
  async update(id: string, product: Partial<Product>, imageFile: File | null): Promise<void> {
    const docRef = doc(db, 'products', id);
    const updateData = { ...product };

    if (imageFile) {
      try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const oldImageUrl = docSnap.data().image;
          const oldFileName = this.getFileNameFromUrl(oldImageUrl);

          if (oldFileName && !oldImageUrl.includes('placehold.co')) {
            const { error: deleteError } = await supabase.storage
              .from(this.bucketName)
              .remove([oldFileName]);

            if (deleteError) {
              console.error("No se pudo borrar el archivo viejo de Supabase:", deleteError.message);
            }
          }
        }
      } catch (err) {
        console.error("Error al buscar el producto para actualizar la imagen:", err);
      }

      // Subimos la nueva imagen recién seleccionada
      updateData.image = await this.uploadImage(imageFile);
    }

    await updateDoc(docRef, updateData);
  }

  // 3. DELETE — borra también la imagen del producto en Supabase. Mismo motivo que update():
  // ninguna venta depende ya de esta URL.
  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'products', id);

    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const imageUrl = docSnap.data().image;
        const fileName = this.getFileNameFromUrl(imageUrl);

        if (fileName && !imageUrl.includes('placehold.co')) {
          const { error: deleteError } = await supabase.storage
            .from(this.bucketName)
            .remove([fileName]);
          

          if (deleteError) {
            console.error("Error eliminando archivo en Supabase al borrar producto:", deleteError.message);
          }
        }
      }
    } catch (err) {
      console.error("Error al buscar el producto antes de su eliminación:", err);
    }

    await deleteDoc(docRef);
  }
}