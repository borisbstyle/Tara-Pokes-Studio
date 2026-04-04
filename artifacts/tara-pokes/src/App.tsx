import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";
import TattooChatbot from "@/components/TattooChatbot";
import { LanguageProvider } from "@/lib/i18n";

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  const isAdmin = location === "/admin";

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
      {!isAdmin && <TattooChatbot />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
