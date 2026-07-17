import { RouterProvider } from "react-router";
import { appRouter } from "./app.router";
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthInitializer } from "./layer-presentation-ui/modules/auth/hooks/useAuthInitializer";

const queryClient = new QueryClient()

export const BaguiSportApp = () => {

  // ENCENDEMOS EL MONITOR GLOBAL: se encarga de recuperar la sesión al recargar
  useAuthInitializer();

  return (
    <QueryClientProvider client={ queryClient }>
      <RouterProvider router={ appRouter } />
        <Toaster position="bottom-center" richColors/>
      <ReactQueryDevtools initialIsOpen={ false } />
    </QueryClientProvider>
  )
}
