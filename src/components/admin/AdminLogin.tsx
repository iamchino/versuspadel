/**
 * AdminLogin.tsx — Password gate for the admin panel
 *
 * Displays a premium login screen matching the VERSUS dark/gold design system.
 * On success, stores a session token and calls onSuccess().
 *
 * ── DEMO MODE ──
 * In development, use the password "demo" to access the dashboard
 * without a real backend. All data will be sample/fake products.
 */

import { useState } from "react";
import { login } from "@/lib/admin-api";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Loader2, FlaskConical } from "lucide-react";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    try {
      await login(password);
      toast.success("Acceso concedido");
      onSuccess();
    } catch (err: any) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast.error(err.message || "Contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Radial gold glow background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div
        className={`relative w-full max-w-md animate-scale-in ${shake ? "animate-shake" : ""}`}
      >
        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-lg p-8 md:p-10 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-7 h-7 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl text-center uppercase tracking-wide mb-2">
            <span className="text-white">Admin</span>{" "}
            <span className="text-gold-gradient">Panel</span>
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-8">
            Ingresá la contraseña para gestionar productos
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                autoFocus
                className="w-full bg-secondary/50 border border-border/50 rounded-md px-4 py-3.5 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>

            {/* Demo mode hint — only visible in development */}
            {import.meta.env.DEV && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-md px-4 py-3">
                <FlaskConical className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-400">Modo Demo</p>
                  <p className="text-xs text-muted-foreground/70">
                    Ingresá la contraseña{" "}
                    <code className="text-amber-400 font-bold bg-amber-500/10 px-1 rounded">demo</code>
                    {" "}para ver la interfaz sin backend
                  </p>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          VERSUS Pádel — Panel de Administración
        </p>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
