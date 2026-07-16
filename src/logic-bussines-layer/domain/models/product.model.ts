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