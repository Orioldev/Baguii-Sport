import { useState } from "react";
import { AdminSidebar } from "../modules/admin/components/AdminSidebar";
import { AdminHeader } from "../modules/admin/components/AdminHeader";
import { Outlet } from "react-router";


export const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    // Agregamos dark:bg-zinc-950 para el fondo general en modo oscuro
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex transition-colors duration-300">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        
        {/* Agregamos el fondo del área de contenido principal */}
        <main className="flex-1 bg-gray-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
