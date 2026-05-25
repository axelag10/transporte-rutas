import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import RouteMap from "@/pages/RouteMap";
import Panel from "@/pages/Panel";
import PanelVehiculos from "@/pages/PanelVehiculos";
import PanelNuevaRuta from "@/pages/PanelNuevaRuta";
import PanelTurnos from "@/pages/PanelTurnos";
import { useState, useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

function useTheme() {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("transbus-theme") === "light";
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isLight) {
      html.classList.add("light");
      localStorage.setItem("transbus-theme", "light");
    } else {
      html.classList.remove("light");
      localStorage.setItem("transbus-theme", "dark");
    }
  }, [isLight]);

  return { isLight, toggle: () => setIsLight((v) => !v) };
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2.93" y1="2.93" x2="4.34" y2="4.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11.66" y1="11.66" x2="13.07" y2="13.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11.66" y1="4.34" x2="13.07" y2="2.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2.93" y1="13.07" x2="4.34" y2="11.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function NavBar() {
  const [location] = useLocation();
  const { isLight, toggle } = useTheme();
  const isPanel = location.startsWith("/panel");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 glass">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="5" width="14" height="8" rx="2" fill="currentColor" className="text-primary-foreground"/>
              <rect x="3" y="2" width="10" height="5" rx="1.5" fill="currentColor" className="text-primary-foreground" opacity="0.7"/>
              <circle cx="4" cy="13" r="1.5" fill="currentColor" className="text-primary-foreground"/>
              <circle cx="12" cy="13" r="1.5" fill="currentColor" className="text-primary-foreground"/>
            </svg>
          </div>
          <span className="font-bold text-foreground tracking-tight">TransBus</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/" className={`px-3 py-1.5 text-sm rounded-md transition-colors ${!isPanel ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Rutas
          </Link>
          <Link href="/panel" className={`px-3 py-1.5 text-sm rounded-md transition-colors ${isPanel && !location.startsWith('/panel/turnos') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Panel
          </Link>
          <Link href="/panel/turnos" className={`px-3 py-1.5 text-sm rounded-md transition-colors ${location.startsWith('/panel/turnos') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Turnos
          </Link>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            onClick={toggle}
            aria-label={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Router() {
  return (
    <div className="pt-14 min-h-screen">
      <NavBar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/rutas/:id" component={RouteMap} />
        <Route path="/panel" component={Panel} />
        <Route path="/panel/vehiculos" component={PanelVehiculos} />
        <Route path="/panel/rutas/nueva" component={PanelNuevaRuta} />
        <Route path="/panel/turnos" component={PanelTurnos} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
