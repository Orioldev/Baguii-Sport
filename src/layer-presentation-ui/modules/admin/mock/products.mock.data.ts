import { daysAgo } from "@/layer-presentation-ui/helpers/helpers";
import { type Product } from "@/logic-bussines-layer/domain/models/product.model";
import type { PaymentMethod } from "../pages/compras/ComprasPage";
import type { Purchase } from "../pages/compras/ComprasPage";
import type { MonthRow, WeekRow, YearRow } from "../pages/dashboard/DashboardPage";
import type { Client } from "../pages/clientes/ClientesPage";
import type { Sale } from "@/logic-bussines-layer/domain/models/sale.model";


export const initialProducts: Product[] = [
  {
    id: "1",
    title: "Nike Air Zoom Pegasus",
    description: "Zapatillas de running con amortiguación responsiva.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    minStock: 5,
    createdAt: daysAgo(0),
    sizes: [
      { size: "40", price: 75, qty: 10 },
      { size: "41", price: 75, qty: 8 },
      { size: "42", price: 78, qty: 4 },
    ],
  },
  {
    id: "2",
    title: "Adidas Ultraboost 22",
    description: "Comodidad superior con tecnología Boost.",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
    minStock: 3,
    createdAt: daysAgo(1),
    sizes: [
      { size: "39", price: 120, qty: 6 },
      { size: "42", price: 125, qty: 9 },
    ],
  },
  {
    id: "3",
    title: "Puma RS-X",
    description: "Estilo retro con diseño chunky moderno.",
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
    minStock: 4,
    createdAt: daysAgo(7),
    sizes: [
      { size: "40", price: 95, qty: 12 },
      { size: "43", price: 98, qty: 5 },
    ],
  },
  {
    id: "4",
    title: "New Balance 574",
    description: "Clásico atemporal con suela ENCAP.",
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80",
    minStock: 2,
    createdAt: daysAgo(20),
    sizes: [
      { size: "41", price: 85, qty: 7 },
      { size: "42", price: 85, qty: 3 },
    ],
  },
];

export const initialSales: Sale[] = [
  {
    id: "s1",
    productId: "1",
    productTitle: "Nike Air Zoom Pegasus",
    productImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    paymentMethod: "efectivo",
    date: daysAgo(0),
    items: [
      { size: "40", price: 75, qty: 2 },
      { size: "41", price: 75, qty: 1 },
    ],
    description: "Venta en tienda física.",
    totalUsd: 225,
    rate: 700
  },
  {
    id: "s2",
    productId: "2",
    productTitle: "Adidas Ultraboost 22",
    productImage:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
    paymentMethod: "usdt",
    date: daysAgo(2),
    items: [{ size: "42", price: 125, qty: 1 }],
    description: "Cliente recurrente, pago en cripto.",
    totalUsd: 125,
    rate: 700

  },
];

export const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "pago_movil", label: "Pago móvil" },
  { value: "punto", label: "Punto de venta" },
  { value: "usdt", label: "USDT" },
];

// ---------- Mock ----------
export const initialPurchases: Purchase[] = [
  {
    id: "c1",
    name: "Lote Nike Air Zoom Pegasus",
    paymentMethod: "usdt",
    date: daysAgo(1),
    description: "Compra al mayor de 20 pares al proveedor habitual.",
    totalUsd: 950,
    rate: 0
  },
  {
    id: "c2",
    name: "Bolsas y empaques",
    paymentMethod: "efectivo",
    date: daysAgo(4),
    description: "Material de empaque para entregas.",
    totalUsd: 45,
    rate: 0
  },
  {
    id: "c3",
    name: "Adidas Ultraboost (5 pares)",
    paymentMethod: "pago_movil",
    date: daysAgo(0),
    description: "Reposición de inventario.",
    totalUsd: 525,
    rate: 0
  },
];

export const initialClients: Client[] = [
  {
    id: "cl-1",
    name: "Alexander Pirela",
    phone: "+58 412-5551234",
    createdAt: daysAgo(2),
    company: "Inversiones El Chamo c.a",
  },
  {
    id: "cl-2",
    name: "Boutique Las Mercedes",
    phone: "+58 212-9912233",
    createdAt: daysAgo(15),
    company: "Gerente de Compras",
  },
  {
    id: "cl-3",
    name: "Carlos Mendoza",
    phone: "+58 424-7778899",
    createdAt: daysAgo(30),
    company: "Particular",
  },
];


/* ---------- Mock Data Dashboard ----------
   🟢 Nota: desde que DashboardPage.tsx usa useDashboardStats() con datos reales,
   estos tres arrays ya no se consumen ahí. Se dejan por si algún otro lugar
   los sigue importando; si no, puedes borrarlos con seguridad. */

export const weekData: WeekRow[] = [
  { label: "Lu", ventas: 320, compras: 180, unidadesV: 12, unidadesC: 8 },
  { label: "Ma", ventas: 480, compras: 220, unidadesV: 18, unidadesC: 10 },
  { label: "Mi", ventas: 410, compras: 310, unidadesV: 15, unidadesC: 14 },
  { label: "Ju", ventas: 560, compras: 240, unidadesV: 21, unidadesC: 11 },
  { label: "Vi", ventas: 720, compras: 380, unidadesV: 27, unidadesC: 16 },
  { label: "Sá", ventas: 890, compras: 450, unidadesV: 34, unidadesC: 19 },
  { label: "Do", ventas: 510, compras: 200, unidadesV: 19, unidadesC: 9 },
];

export const monthData: MonthRow[] = [
  { label: "S1", ventas: 2400, compras: 1500, unidadesV: 92, unidadesC: 64 },
  { label: "S2", ventas: 3100, compras: 1800, unidadesV: 118, unidadesC: 75 },
  { label: "S3", ventas: 2750, compras: 2100, unidadesV: 104, unidadesC: 88 },
  { label: "S4", ventas: 3680, compras: 1950, unidadesV: 142, unidadesC: 81 },
];

export const yearData: YearRow[] = [
  { label: "En", ventas: 8200, compras: 5400 },
  { label: "Fe", ventas: 7600, compras: 4900 },
  { label: "Ma", ventas: 9100, compras: 6100 },
  { label: "Ab", ventas: 8800, compras: 5800 },
  { label: "My", ventas: 10400, compras: 6700 },
  { label: "Jn", ventas: 11200, compras: 7200 },
  { label: "Ju", ventas: 10800, compras: 7000 },
  { label: "Ag", ventas: 11900, compras: 7600 },
  { label: "Se", ventas: 12400, compras: 7900 },
  { label: "Oc", ventas: 13100, compras: 8300 },
  { label: "No", ventas: 12700, compras: 8100 },
  { label: "Di", ventas: 14200, compras: 9000 },
];