import React from 'react';
import { 
  Users, 
  Settings, 
  ShoppingCart, 
  Bell, 
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  TrendingUp
} from 'lucide-react';
import { CustomLogo } from '@/components/custom/CustomLogo';
import { Link, useLocation } from 'react-router';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {

    const { pathname } = useLocation();
    
    const menuItems = [
        { icon: Package,        label: 'Productos',      to: '/admin' },
        { icon: TrendingUp,     label: 'Ventas',          to: '/admin/ventas' },
        { icon: ShoppingCart,   label: 'Compras',         to: '/admin/compras' },
        { icon: Users,          label: 'Clientes',        to: '/admin/clientes' },
        { icon: CircleDollarSign, label: 'Cobranzas',     to: '/admin/cobranzas' },
        { icon: LayoutDashboard,label: 'Dashboard',       to: '/admin/dashboard' },
        { icon: Bell,           label: 'Notificaciones',  to: '/admin/notificaciones' },
        { icon: Settings,       label: 'Configuración',   to: '/admin/configuracion' },
    ];

    const isActiveRoute = (to: string) => {

        return pathname === to; // True, false
    }

  return (
    <>
      {/* Backdrop — adaptado a modo oscuro */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Botón flotante móvil — adaptado a modo oscuro */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-md md:hidden text-gray-900 dark:text-gray-100"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Contenedor del Sidebar — Agregadas clases dark:bg-zinc-900 y dark:border-zinc-800 */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        md:relative md:inset-auto md:z-auto
        bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800
        transition-all duration-300 ease-in-out
        flex flex-col

        ${isCollapsed
          ? 'w-0 overflow-hidden md:w-20'   
          : 'w-64'                           
        }
      `}>
        {/* Header del Sidebar — Botón adaptado a dark:hover:bg-zinc-800 */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between h-16">
          {!isCollapsed && <CustomLogo />}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className='text-gray-900 dark:text-gray-100' size={20} />
            ) : (
              <ChevronLeft className='text-gray-900 dark:text-gray-100' size={20} />
            )}
          </button>
        </div>

        {/* Navegación y Enlaces — Agregadas variantes oscuras a las rutas activas e inactivas */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index}>
                  <Link
                    to={item.to || '/admin'}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActiveRoute(item.to || '/xxx')
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};