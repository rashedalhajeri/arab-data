
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import CreatePage from "./pages/CreatePage";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Advertisements from "./pages/Advertisements/index";
import AddAdvertisement from "./pages/Advertisements/AddAdvertisement";
import DashboardLayout from "./components/DashboardLayout";
import QrCodes from "./pages/QrCodes";
import Categories from "./pages/Categories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-page" element={<CreatePage />} />
          
          {/* مسارات لوحة التحكم */}
          <Route path="/dashboard" element={<DashboardLayout><Outlet /></DashboardLayout>}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="advertisements" element={<Advertisements />} />
            <Route path="advertisements/add/:category" element={<AddAdvertisement />} />
            <Route path="advertisements/add" element={<AddAdvertisement />} />
            <Route path="qr-codes" element={<QrCodes />} />
            <Route path="categories" element={<Categories />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
