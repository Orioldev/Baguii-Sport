# Estructura del modelo del proyecto

Este documento describe la estructura actual de los modelos de dominio, repositorios y reglas de negocio que se están utilizando en la aplicación.

---

## 1. Visión general

El proyecto organiza la lógica de negocio en una capa de dominio independiente, separada de la UI y de la persistencia. Esto permite que las reglas del sistema se definan de forma clara y luego sean implementadas por repositorios concretos en Firebase o Supabase.

Actualmente el modelo está orientado a:

- usuarios y autenticación,
- productos con stock y tallas,
- ventas con detalle por talla,
- configuración del sistema (tasa del dólar),
- y futuras entidades como compras, clientes y deudas.

---

## 2. Modelos de dominio

### 2.1 Usuario
Archivo: `src/logic-bussines-layer/domain/models/user.model.ts`

```ts
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
}
```

Representa al usuario autenticado del sistema, en este caso el dueño de la tienda.

### 2.2 Configuración del sistema
Archivo: `src/logic-bussines-layer/domain/models/config.model.ts`

```ts
export interface SystemConfig {
  dollarRate: number;
  updatedAt?: Date;
}
```

Modelo utilizado para manejar la tasa del dólar que se usa en los cálculos de ventas y reportes.

### 2.3 Producto
Archivo: `src/logic-bussines-layer/domain/models/product.model.ts`

```ts
export interface SizeRow {
  size: string;
  price: number;
  qty: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  minStock: number;
  createdAt: Date;
  sizes: SizeRow[];
}
```

Este modelo representa un calzado o producto del inventario. Cada producto contiene:

- un título,
- una descripción,
- una imagen,
- un stock mínimo,
- una fecha de creación,
- y un conjunto de tallas con precio y cantidad disponible.

### 2.4 Venta
Archivo: `src/logic-bussines-layer/domain/models/sale.model.ts`

```ts
export interface SaleItem {
  size: string;
  price: number;
  qty: number;
}

export interface Sale {
  id?: string;
  productId: string;
  productTitle: string;
  productImage: string;
  paymentMethod: PaymentMethod;
  date: Date;
  items: SaleItem[];
  description: string;
  totalUsd: number;
  rate: number;
}
```

Este modelo representa una venta registrada por el sistema. La venta:

- está asociada a un producto,
- guarda el detalle por talla,
- almacena el método de pago,
- conserva la fecha de la transacción,
- y guarda la tasa histórica congelada en el momento de la venta.

---

## 3. Repositorios de dominio

### 3.1 Repositorio de productos
Archivo: `src/logic-bussines-layer/domain/repositories/product.repository.ts`

```ts
export interface IProductRepository {
  getAll(): Promise<Product[]>;
  create(product: Omit<Product, 'id' | 'createdAt'>, imageFile: File | null): Promise<Product>;
  update(id: string, product: Partial<Product>, imageFile: File | null): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### 3.2 Repositorio de ventas
Archivo: `src/logic-bussines-layer/domain/repositories/sale.repository.ts`

```ts
export interface SaleRepository {
  createSale(sale: Omit<Sale, "id">): Promise<string>;
  getSales(): Promise<Sale[]>;
  subscribeSales(onUpdate: (sales: Sale[]) => void): () => void;
  deleteSale(id: string): Promise<void>;
  updateSale(id: string, updatedFields: Partial<Omit<Sale, "id">>): Promise<void>;
}
```

Este contrato define la interfaz mínima que debe implementar la capa de persistencia para trabajar con ventas.

---

## 4. Casos de uso

Los casos de uso se encuentran en la carpeta `src/logic-bussines-layer/application/uses-cases`.

### 4.1 Productos
Actualmente hay casos de uso para:

- `getProductsUseCase`
- `createProductUseCase`
- `updateProductUseCase`
- `deleteProductUseCase`

Estas clases se encargan de encapsular la lógica de negocio asociada a la gestión del inventario.

### 4.2 Ventas
Se ha iniciado la definición del flujo de ventas con un caso de uso para crear ventas, con validaciones básicas como:

- una venta debe contener al menos un producto/talla,
- la cantidad vendida debe ser mayor a cero,
- y la operación debe delegarse al repositorio para que la persistencia y el stock se manejen de forma centralizada.

---

## 5. Persistencia y almacenamiento

### 5.1 Firebase
Se usa Firebase para:

- autenticación de usuarios,
- Firestore para almacenamiento de productos y ventas,
- y configuración del sistema.

### 5.2 Supabase Storage
Se usa Supabase Storage para guardar las imágenes de los productos.

Esto separa la gestión del contenido multimedia del almacenamiento estructural de los datos principales.

---

## 6. Reglas de negocio actuales

### 6.1 Inventario
- cada producto tiene tallas con stock disponible,
- el stock se gestiona por talla,
- una venta descuenta unidades del stock disponible.

### 6.2 Ventas
- cada venta conserva la tasa del dólar congelada al momento de registrarse,
- cada venta puede estar asociada a un producto y a varias tallas,
- el detalle de la venta se almacena por talla y cantidad.

### 6.3 Configuración
- el sistema permite guardar una tasa del dólar que se usa en cálculos de negocio y reportes.

---

## 7. Flujo de datos esperado

1. La capa de presentación captura los datos del usuario en la UI.
2. Se invoca un caso de uso del dominio.
3. El caso de uso delega el trabajo al repositorio correspondiente.
4. La persistencia concreta (Firebase/Supabase) ejecuta la operación real.
5. La UI se actualiza con los datos ya persistidos.

---

## 8. Estado actual del modelo

El proyecto ya no está solo en una etapa de definición conceptual. Actualmente el modelo ya contempla:

- una estructura de dominio clara,
- repositorios definidos para productos y ventas,
- lógica de negocio separada de la UI,
- integración con Firebase y Supabase,
- y un enfoque orientado a inventario, ventas y configuración del negocio.

Este archivo debe servir como referencia para mantener coherencia entre la capa de dominio, la persistencia y la interfaz.
