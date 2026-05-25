import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import RouteMap from "@/pages/RouteMap";
import Panel from "@/pages/Panel";
import PanelVehiculos from "@/pages/PanelVehiculos";
import PanelNuevaRuta from "@/pages/PanelNuevaRuta";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

function NavBar() {
  const [location] = useLocation();
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
          <Link href="/panel" className={`px-3 py-1.5 text-sm rounded-md transition-colors ${isPanel ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            Panel
          </Link>
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
