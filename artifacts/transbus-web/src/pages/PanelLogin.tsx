import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";

interface Props {
  onLogin: () => void;
}

export default function PanelLogin({ onLogin }: Props) {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      if (res.ok) {
        onLogin();
        navigate("/panel");
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Credenciales incorrectas.");
      }
    } catch {
      setError("Error de red. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="5" width="14" height="8" rx="2" fill="currentColor" className="text-primary-foreground"/>
              <rect x="3" y="2" width="10" height="5" rx="1.5" fill="currentColor" className="text-primary-foreground" opacity="0.7"/>
              <circle cx="4" cy="13" r="1.5" fill="currentColor" className="text-primary-foreground"/>
              <circle cx="12" cy="13" r="1.5" fill="currentColor" className="text-primary-foreground"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-xl text-foreground leading-none">TransBus</p>
            <p className="text-xs text-muted-foreground mt-0.5">Panel de administracion</p>
          </div>
        </div>

        <div className="border border-border rounded-2xl bg-card p-8 shadow-xl">
          <h1 className="text-lg font-semibold text-foreground mb-1">Iniciar sesion</h1>
          <p className="text-sm text-muted-foreground mb-6">Acceso exclusivo para administradores</p>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-3">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="6.5" stroke="#ef4444" strokeWidth="1.5"/>
                <path d="M8 5v3M8 11v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="admin"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3.5 py-2.5 pr-11 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPass ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    {showPass ? (
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z M6 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    ) : (
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z M6 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Verificando..." : "Entrar al panel"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          TransBus — Sistema de rastreo de transporte publico
        </p>
      </div>
    </div>
  );
}
