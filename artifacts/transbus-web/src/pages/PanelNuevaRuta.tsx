import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCreateRoute } from "@workspace/api-client-react";

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

export default function PanelNuevaRuta() {
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [error, setError] = useState('');

  const mutation = useCreateRoute();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre es obligatorio.'); return; }
    setError('');
    mutation.mutate(
      { data: { name: name.trim(), description: description.trim() || null, color } },
      {
        onSuccess: () => navigate('/panel'),
        onError: () => setError('No se pudo crear la ruta. Intenta de nuevo.'),
      }
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/panel">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva ruta</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Registra una nueva ruta de transporte</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nombre de la ruta *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej. Ruta 3 - Oriente/Poniente"
            className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Descripcion</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Breve descripcion del recorrido..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Color de la ruta</label>
          <div className="flex gap-3 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c, ringColor: c }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground font-mono">{color}</span>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/panel">
            <button
              type="button"
              className="flex-1 px-4 py-2.5 rounded-lg bg-muted hover:bg-secondary transition-colors text-sm text-foreground"
            >
              Cancelar
            </button>
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando...' : 'Crear ruta'}
          </button>
        </div>
      </form>
    </main>
  );
}
