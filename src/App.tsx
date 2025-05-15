import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TaskPage from "./pages/TaskPage";
import SchedulePage from "./pages/SchedulePage";
import HiringPage from "./pages/HiringPage";
import MyToolsPage from "@/pages/MyToolsPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import SmartFinancesPage from "./pages/SmartFinancesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/employees" element={<MyToolsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/payroll" element={<NotFound />} />
          <Route path="/hiring" element={<HiringPage />} />
          <Route path="/smart-finances" element={<SmartFinancesPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
