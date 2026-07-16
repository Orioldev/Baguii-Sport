import { useState } from "react";
import { KeyRound, ShieldCheck, User, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PasswordInput } from "./components/PasswordInput";
import { FieldHint } from "./components/FieldHint";
import { useAuthStore } from "../../../auth/hooks/useAuthStore";
import { useVerifyPasswordMutation } from "./hooks/useVerifyPasswordMutation";
import { useChangePasswordMutation } from "./hooks/useChangePasswordMutation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useTogglePassword() {
  const [visible, setVisible] = useState(false);
  return { visible, toggle: () => setVisible((v) => !v) };
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // 🟢 Usuario real de la sesión (necesitamos su email para reautenticar contra Firebase)
  const user = useAuthStore((state) => state.user);

  // Contraseña actual
  const [currentPwd,     setCurrentPwd]     = useState("");
  const [currentChecked, setCurrentChecked] = useState<boolean | null>(null);
  const toggleCurrent = useTogglePassword();

  // Campos desbloqueados
  const unlocked = currentChecked === true;

  // Nueva contraseña
  const [newPwd,    setNewPwd]    = useState("");
  const [repeatPwd, setRepeatPwd] = useState("");
  const toggleNew    = useTogglePassword();
  const toggleRepeat = useTogglePassword();

  // Estado final
  const [saved, setSaved] = useState(false);

  // 🟢 Mutaciones reales contra Firebase Auth
  const verifyMutation = useVerifyPasswordMutation();
  const changeMutation = useChangePasswordMutation();

  // ── Validaciones ──
  const passwordsMatch  = newPwd !== "" && newPwd === repeatPwd;
  const passwordMismatch = repeatPwd !== "" && newPwd !== repeatPwd;
  const newPwdTooShort  = newPwd !== "" && newPwd.length < 8;

  const canSubmit =
    unlocked &&
    passwordsMatch &&
    !newPwdTooShort &&
    !changeMutation.isPending;

  // ── Handlers ──
  const handleCheckCurrentPwd = () => {
    if (!user?.email) {
      // No debería ocurrir dentro del panel admin (ya autenticado), pero por seguridad:
      setCurrentChecked(false);
      return;
    }

    verifyMutation.mutate(
      { email: user.email, currentPassword: currentPwd },
      {
        onSuccess: () => setCurrentChecked(true),
        onError: () => setCurrentChecked(false),
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    changeMutation.mutate(
      { newPassword: newPwd, repeatPassword: repeatPwd },
      {
        onSuccess: () => {
          setSaved(true);
          setNewPwd("");
          setRepeatPwd("");
          setCurrentPwd("");
          setCurrentChecked(null);
          setTimeout(() => setSaved(false), 3000);
        },
        onError: (err: any) => {
          // Si la reautenticación expiró entre "Verificar" y "Cambiar datos",
          // Firebase rechaza el cambio: pedimos verificar de nuevo.
          if (err?.message?.toLowerCase().includes("verificar")) {
            setCurrentChecked(null);
          }
        },
      }
    );
  };

  return (

    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-lg px-4 py-10">

          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <KeyRound className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-foreground">Seguridad y acceso</h1>
              <p className="text-xs text-muted-foreground">Actualiza tus credenciales de acceso</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

            {/* ── Sección 1: Verificar contraseña actual ── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Verificación</span>
              </div>

              <div>
                <Label htmlFor="currentPwd" className="mb-1.5 block text-sm">
                  Contraseña actual
                </Label>
                <div className="flex gap-2">
                  <PasswordInput
                    id="currentPwd"
                    value={currentPwd}
                    onChange={(v) => {
                      setCurrentPwd(v);
                      setCurrentChecked(null);
                    }}
                    placeholder="Ingresa tu contraseña actual"
                    disabled={verifyMutation.isPending}
                    visible={toggleCurrent.visible}
                    onToggle={toggleCurrent.toggle}
                    className={cn(
                      currentChecked === false && "border-destructive focus-visible:ring-destructive",
                      currentChecked === true  && "border-emerald-500 focus-visible:ring-emerald-500",
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCheckCurrentPwd}
                    disabled={currentPwd.length < 1 || verifyMutation.isPending}
                    className="shrink-0"
                  >
                    {verifyMutation.isPending ? "Verificando..." : "Verificar"}
                  </Button>
                </div>

                {currentChecked === false && (
                  <FieldHint
                    type="error"
                    text={verifyMutation.error?.message ?? "Contraseña incorrecta. Inténtalo de nuevo."}
                  />
                )}
                {currentChecked === true && (
                  <FieldHint type="ok" text="✓ Contraseña verificada. Ya puedes actualizar tus datos." />
                )}
                {currentChecked === null && (
                  <FieldHint type="info" text="Debes verificar tu contraseña actual para continuar." />
                )}
              </div>
            </section>

            {/* ── Sección 2: Nuevos datos (bloqueada hasta verificar) ── */}
            <section
              className={cn(
                "flex flex-col gap-5 rounded-xl border p-5 transition-opacity",
                !unlocked && "pointer-events-none select-none opacity-40",
              )}
            >
              <div className="flex items-center gap-2 border-b pb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Nuevos datos</span>
                {!unlocked && (
                  <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Bloqueado
                  </span>
                )}
              </div>

              {/* Nueva contraseña */}
              <div>
                <Label htmlFor="newPwd" className="mb-1.5 block text-sm">
                  Nueva contraseña
                </Label>
                <PasswordInput
                  id="newPwd"
                  value={newPwd}
                  onChange={setNewPwd}
                  placeholder="Mínimo 8 caracteres"
                  disabled={!unlocked || changeMutation.isPending}
                  visible={toggleNew.visible}
                  onToggle={toggleNew.toggle}
                  className={cn(newPwdTooShort && "border-destructive")}
                />
                {newPwdTooShort && (
                  <FieldHint type="error" text="La contraseña debe tener al menos 8 caracteres." />
                )}
              </div>

              {/* Repetir contraseña */}
              <div>
                <Label htmlFor="repeatPwd" className="mb-1.5 block text-sm">
                  Confirmar nueva contraseña
                </Label>
                <PasswordInput
                  id="repeatPwd"
                  value={repeatPwd}
                  onChange={setRepeatPwd}
                  placeholder="Repite la nueva contraseña"
                  disabled={!unlocked || changeMutation.isPending}
                  visible={toggleRepeat.visible}
                  onToggle={toggleRepeat.toggle}
                  className={cn(
                    passwordMismatch  && "border-destructive",
                    passwordsMatch    && "border-emerald-500",
                  )}
                />
                {passwordMismatch && (
                  <FieldHint type="error" text="Las contraseñas no coinciden." />
                )}
                {passwordsMatch && (
                  <FieldHint type="ok" text="✓ Las contraseñas coinciden." />
                )}
              </div>
            </section>

            {/* Error general del cambio (ej. requires-recent-login, red, etc.) */}
            {changeMutation.isError && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {changeMutation.error?.message ?? "No se pudo actualizar la contraseña."}
              </div>
            )}

            {/* ── Botón submit ── */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "w-full gap-2 transition-all",
                saved && "bg-emerald-600 hover:bg-emerald-600",
              )}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Datos actualizados
                </>
              ) : changeMutation.isPending ? (
                "Actualizando..."
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Cambiar datos
                </>
              )}
            </Button>

          </form>
        </div>
      </main>
    </div>
  );
}