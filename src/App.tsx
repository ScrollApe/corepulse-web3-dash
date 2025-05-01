
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./providers/WalletProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Mint from "./pages/Mint";
import Leaderboard from "./pages/Leaderboard";
import Lore from "./pages/Lore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WalletProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/lore" element={<Lore />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WalletProvider>
);

export default App;
