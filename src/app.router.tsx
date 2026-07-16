import { createBrowserRouter, Navigate } from "react-router";
import { AuthLayout } from "./layer-presentation-ui/layouts/AuthLayout";
import { AdminLayout } from "./layer-presentation-ui/layouts/AdminLayout";
import { ProtectedRoute } from "./layer-presentation-ui/services/ProtectedRoutes"; // Ajustado a tu ruta real
import { useAuthStore } from "./layer-presentation-ui/modules/auth/hooks/useAuthStore";
import { lazy, Suspense } from "react";

// Componente helper para envolver las páginas Lazy y evitar parpadeos sin fallback
const PageWithSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense 
    fallback={
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-gray-50 dark:bg-zinc-950 text-muted-foreground font-medium animate-pulse">
        <div className="flex items-center gap-2">
          {/* Opcional: Un pequeño spinner sutil para mejorar la UX */}
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="dark:text-slate-100">Cargando...</span>
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

// COMPONENTES CONECTORES REACTIVOS (Solución al estancamiento)
// Evalúan el store en tiempo real cada vez que cambian de ruta o de estado

const PublicGate = () => {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  
  // Mientras Firebase esté buscando la sesión, congelamos la pantalla de forma profesional
  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground font-medium">
        Verificando credenciales...
      </div>
    );
  }

  const userExists = !!user;
  return <ProtectedRoute allowed={!userExists} redirectTo="/admin" />;
};

const PrivateGate = () => {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted-foreground font-medium">
        Verificando credenciales...
      </div>
    );
  }

  const userExists = !!user;
  return <ProtectedRoute allowed={userExists} redirectTo="/" />;
};

// Páginas — lazy
const LoginPage        = lazy(() => import("./layer-presentation-ui/modules/auth/pages/login/LoginPage"));
const ProductosPage    = lazy(() => import("./layer-presentation-ui/modules/admin/pages/productos/ProductosPage"));
const VentasPage       = lazy(() => import("./layer-presentation-ui/modules/admin/pages/ventas/VentasPage"));
const ComprasPage      = lazy(() => import("./layer-presentation-ui/modules/admin/pages/compras/ComprasPage"));
const ClientesPage     = lazy(() => import("./layer-presentation-ui/modules/admin/pages/clientes/ClientesPage"));
const CobranzasPage    = lazy(() => import("./layer-presentation-ui/modules/admin/pages/cobranzas/CobranzasPage"));
const DashboardPage    = lazy(() => import("./layer-presentation-ui/modules/admin/pages/dashboard/DashboardPage"));
const NotificacionesPage = lazy(() => import("./layer-presentation-ui/modules/admin/pages/notificaciones/NotificacionesPage"));
const ConfiguracionPage  = lazy(() => import("./layer-presentation-ui/modules/admin/pages/configuracion/ConfiguracionPage"));

export const appRouter = createBrowserRouter([
    // 1. SECCIÓN DE AUTENTICACIÓN (Login)
    {
        element: <PublicGate />, // Usamos el conector dinámico público
        children: [
            {
                path: '/',
                element: <AuthLayout />,
                children: [
                    {
                        index: true,
                        element: <PageWithSuspense><LoginPage /></PageWithSuspense>
                    }
                ]
            }
        ]
    },

    // 2. SECCIÓN DE ADMINISTRACIÓN (Panel de control de Bagui Sports)
    {
        element: <PrivateGate />, // Usamos el conector dinámico privado
        children: [
            {
                path: '/admin',
                element: <AdminLayout />,
                children: [
                    {
                        index: true,
                        element: <PageWithSuspense><ProductosPage /></PageWithSuspense>
                    },
                    {
                        path: 'compras',
                        element: <PageWithSuspense><ComprasPage /></PageWithSuspense>
                    },
                    {
                        path: 'ventas',
                        element: <PageWithSuspense><VentasPage /></PageWithSuspense>
                    },
                    {
                        path: 'clientes',
                        element: <PageWithSuspense><ClientesPage /></PageWithSuspense>
                    },
                    {
                        path: 'cobranzas',
                        element: <PageWithSuspense><CobranzasPage /></PageWithSuspense>
                    },
                    {
                        path: 'dashboard',
                        element: <PageWithSuspense><DashboardPage /></PageWithSuspense>
                    },
                    {
                        path: 'notificaciones',
                        element: <PageWithSuspense><NotificacionesPage /></PageWithSuspense>
                    },
                    {
                        path: 'configuracion',
                        element: <PageWithSuspense><ConfiguracionPage /></PageWithSuspense>
                    },
                ]
            }
        ]
    },

    // Catch-all
    {
        path: '*',
        element: <Navigate to='/' replace />
    },
]);