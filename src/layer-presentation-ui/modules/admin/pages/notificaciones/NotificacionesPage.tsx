import { Bell, CheckCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StockNotifCard } from "./components/StockNotiCard";
import { CobroNotifCard } from "./components/CobroNotiCard";
import { CountBadge } from "./components/CountBadge";
import { EmptyTab } from "./components/EmptyTabs";
import { useNotifications } from "../../hooks/useNotifications";

// 🟢 Los tipos ahora viven en el dominio (igual que Debt/Product) y se re-exportan aquí
// para que StockNotiCard.tsx y CobroNotiCard.tsx sigan importándolos sin cambios.
export type { Notification, StockNotification, DebtNotification } from "@/logic-bussines-layer/domain/models/notification.model";

// ─── Page ─────────────────────────────────────────────────────────────────────

export const NotificationsPage = () => {
  // 🟢 Ya no se lee un store estático: se derivan en vivo de Productos y Deudas reales
  const { notifications, isLoading, hasError, retry, removeNotification, clearNotificationsByType } = useNotifications();

  const stockNotifs = notifications.filter((n) => n.type === "stock");
  const debtNotifs = notifications.filter((n) => n.type === "debt");

  if (hasError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">No se pudieron cargar las notificaciones</p>
          <p className="text-sm text-muted-foreground">
            Revisa tu conexión e inténtalo de nuevo.
          </p>
        </div>
        <Button onClick={retry} className="gap-2 mt-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Revisando inventario y cobranzas...</p>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl px-4 py-8">

          {/* Header */}
          <div className="mb-6 flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-foreground" />
            <h1 className="text-lg font-medium text-foreground">Notificaciones</h1>
            {notifications.length > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                {notifications.length}
              </span>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="stock">
            <div className="mb-4 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="stock">
                  Stock mínimo
                  <CountBadge count={stockNotifs.length} />
                </TabsTrigger>
                <TabsTrigger value="debt">
                  Cobros pendientes
                  <CountBadge count={debtNotifs.length} />
                </TabsTrigger>
              </TabsList>


            </div>

            {/* Tab: Stock */}
            <TabsContent value="stock" className="mt-0">
              {stockNotifs.length > 0 ? (
                <>
                  <div className="flex flex-col gap-2">
                    {stockNotifs.map((n) => (
                      <StockNotifCard key={n.id} notif={n} onDelete={removeNotification} />
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => clearNotificationsByType("stock")}
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Limpiar stock
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyTab message="No hay alertas de stock mínimo." />
              )}
            </TabsContent>

            {/* Tab: Deudas */}
            <TabsContent value="debt" className="mt-0">
              {debtNotifs.length > 0 ? (
                <>
                  <div className="flex flex-col gap-2">
                    {debtNotifs.map((n) => (
                      <CobroNotifCard key={n.id} notif={n} onDelete={removeNotification} />
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => clearNotificationsByType("debt")}
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Limpiar cobros
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyTab message="No hay cobros pendientes para hoy." />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default NotificationsPage;