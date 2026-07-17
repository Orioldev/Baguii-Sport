import React, { useState } from 'react';
import { useLoginMutation } from '../../hooks/useLoginMutation';
import { useResetPasswordMutation } from '../../hooks/useResetPasswordMutation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import baguiiLogo from '@/layer-presentation-ui/assets/baguii-logo.png';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Consumimos la mutación de TanStack Query enlazada a la lógica de negocio
  const { mutate: loginMutate, isPending: isLoginPending } = useLoginMutation();

  const { mutate: resetMutate, isPending: isResetPending } = useResetPasswordMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutate(
      { email, password },
      {
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  // Función controlada para disparar el olvido de contraseña
  const handleForgotPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!email) {
      toast.warning('Ingresa primero tu correo electrónico en el campo superior para poder enviarte el enlace de recuperación.');
      return;
    }

    resetMutate(email, {
      onSuccess: () => {
        toast.success(`¡Enlace enviado! Revisa la bandeja de entrada de ${email}.`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  // Combinamos los estados de carga globales
  const isPending = isLoginPending || isResetPending;

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted flex items-center justify-center p-4 relative">
      {/* Elemento decorativo de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>


      <div className="w-full max-w-5xl relative z-10 flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-16">

        {/* Panel del logo: arriba del formulario en móvil/tablet, al costado en escritorio */}
        <div className="flex shrink-0 items-center justify-center">
          <img
            src={baguiiLogo}
            alt="Bagui Sports"
            className="h-24 w-24 select-none object-contain drop-shadow-sm sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-64 lg:w-64 xl:h-72 xl:w-72"
          />
        </div>

        {/* Formulario */}
        <div className="w-full max-w-md">
          <Card className="border border-border/50 shadow-lg backdrop-blur-sm bg-card/95">
            <div className="p-6 space-y-6 sm:p-8">

              {/* Título de Bagui Sports */}
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">Sistema de Gestión de Inventario</p>
              </div>

              {/* Formulario de Autenticación */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Campo Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    required
                    className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isPending}
                      required
                      className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                          <EyeOff className="h-5 w-5 animate-in fade-in duration-200" />
                        ) : (
                          <Eye className="h-5 w-5 animate-in fade-in duration-200" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Botón de Inicio de Sesión con Spinner de carga */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all duration-200 mt-6 cursor-pointer"
                >
                  {isLoginPending ? 'Iniciando sesión...' : isResetPending ? 'Enviando enlace...' : 'Iniciar Sesión'}
                </Button>
              </form>

              {/* Divisor Visual */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-card text-muted-foreground">O</span>
                </div>
              </div>

              {/* Opciones Adicionales de Cuenta */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isPending}
                  className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Footer de la Marca */}
              <div className="text-center text-xs text-muted-foreground pt-2">
                <p>© {new Date().getFullYear()} Bagui Sports. Todos los derechos reservados.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;