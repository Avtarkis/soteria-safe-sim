
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ThreatsMap from "./components/ThreatsMap";
import CyberSecurity from "./components/CyberSecurity";
import EmergencyResponse from "./components/EmergencyResponse";
import Subscription from "./components/Subscription";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/map" element={<Layout><ThreatsMap /></Layout>} />
          <Route path="/security" element={<Layout><CyberSecurity /></Layout>} />
          <Route path="/emergency" element={<Layout><EmergencyResponse /></Layout>} />
          <Route path="/subscription" element={<Layout><Subscription /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
