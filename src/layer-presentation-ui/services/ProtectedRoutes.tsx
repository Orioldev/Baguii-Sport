import { Navigate, Outlet } from 'react-router';

interface ProtectedRouteProps {
  allowed: boolean;
  redirectTo: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowed, redirectTo }) => {
  // Si la condición no se cumple, redirigimos de inmediato
  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si se cumple, renderizamos las rutas hijas (el Layout correspondiente)
  return <Outlet />;
};