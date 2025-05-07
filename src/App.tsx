
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./providers/WalletProvider";
import { ActivityProvider } from "./providers/ActivityProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Mint from "./pages/Mint";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import CrewDirectory from "./pages/CrewDirectory";

// Create a new query client with retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <WalletProvider>
    <QueryClientProvider client={queryClient}>
      <ActivityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" closeButton={true} />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/crews" element={<CrewDirectory />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ActivityProvider>
    </QueryClientProvider>
  </WalletProvider>
);

export default App;
