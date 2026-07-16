import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogoutMutation } from '../../auth/hooks/useLogoutMutation';
// 🟢 FIX: el conteo real de notificaciones ya no vive en el store de Zustand
// (ese ahora solo guarda qué notificaciones descartó el usuario). Vive en el
// hook que las deriva en vivo de Productos + Deudas.
import { useNotifications } from '../hooks/useNotifications';
import { useDollarRate } from '@/layer-presentation-ui/hooks/useDollarRate';


import { Bell, LogOut, Moon, Package, Pencil, Sun } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AdminHeader: React.FC = () => {

    // 1. Inicializamos el estado modo claro/oscuro leyendo directamente de localStorage
    const [isDark, setIsDark] = useState(() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark' || 
              document.documentElement.classList.contains('dark');
      }
      return false;
    });

    // 2. Efecto para aplicar la clase al html de forma sincronizada con el estado
    useEffect(() => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark'); // <-- Guarda persistente
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light'); // <-- Guarda persistente
      }
    }, [isDark]);

    const toggleTheme = () => {
      setIsDark(!isDark);
    };


    const [rateOpen, setRateOpen] = useState(false);
    const navigate = useNavigate(); // <-- Instanciamos el navegador nativo

    // 🟢 Mismo hook que usa NotificacionesPage: productos + deudas en vivo, ya
    // filtrados por lo que el usuario descartó. El badge del header y la página
    // de notificaciones ahora SIEMPRE muestran el mismo número.
    const { notifications } = useNotifications();
    const notificationsCount = notifications.length;

  // Consumimos el hook de la tasa global sincronizada con Firebase
    const { rate, updateRate, isUpdating } = useDollarRate();
    // Estado local temporal del input dentro del popover
    const [rateDraft, setRateDraft] = useState(rate.toString());

    // Sincronizamos el borrador del input cada vez que la tasa real cambie en la BD
    useEffect(() => {
      setRateDraft(rate.toString());
    }, [rate]);

    const { mutate: logoutMutate, isPending: isLoggingOut } = useLogoutMutation();

    

    const handleSaveRate = () => {
      const n = parseFloat(rateDraft);
      if (!isNaN(n) && n > 0) {
        updateRate(n, {
          onSuccess: () => setRateOpen(false),
        });
      }
    };

    const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      logoutMutate();
    };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur h-16">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="hidden min-[850px]:flex min-w-0 items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h1 className="truncate text-sm font-semibold sm:text-base">
              ¡Bienvenido a Baguii Sport!
            </h1>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3 pl-14 md:pl-0">
            {/* FIX: Botón separado del PopoverTrigger para evitar el error de conversión */}
            <Popover open={rateOpen} onOpenChange={setRateOpen}>
              <PopoverTrigger
                render={
                  <button className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs hover:bg-accent hover:text-accent-foreground sm:text-sm">
                    <span className="font-medium">
                      1$ = {rate.toLocaleString("es-VE")} Bs
                    </span>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                }
              />
              <PopoverContent align="end" className="w-64">
                <div className="space-y-3">
                  <Label htmlFor="rate" className="text-sm">
                    Tasa del dólar (Bs)
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={rateDraft}
                    disabled={isUpdating} // <-- Evita escribir mientras se procesa
                    onChange={(e) => setRateDraft(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRateOpen(false)}
                    >
                      Cancelar
                    </Button>

                    
                    <Button size="sm" onClick={handleSaveRate} disabled={isUpdating}>
                      {isUpdating ? 'Guardando...' : 'Guardar'}
                    </Button>

                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Theme */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="h-9 w-9"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notificaciones"
              onClick={() => navigate('/admin/notificaciones')}
              className="relative h-9 w-9"
            >
              <Bell className="h-4 w-4" />
              {notificationsCount > 0 && (
                <span className="absolute text-white -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {notificationsCount}
                </span>
              )}
            </Button>
            
            {/* Logout */}
            <Button 
              variant="default" 
              type='button'
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut} // Evita doble clic si la red tarda
              className="h-9 ml-auto gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isLoggingOut ? 'Saliendo...' : 'Salir'}
              </span>
            </Button>
          </div>
        </div>
      </header>
  );
};