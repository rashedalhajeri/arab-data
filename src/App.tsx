import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import CreatePage from "./pages/CreatePage";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Advertisements from "./pages/Advertisements/index";
import AddAdvertisement from "./pages/Advertisements/AddAdvertisement";

// في المستقبل، يمكن إضافة صفحات إضافية عند إنشائها
// import Advertisements from "./pages/Advertisements";
// import QrCodes from "./pages/QrCodes";
// import Categories from "./pages/Categories";

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/advertisements" element={<Advertisements />} />
          <Route path="/dashboard/advertisements/add/:category" element={<AddAdvertisement />} />
          <Route path="/dashboard/advertisements/add" element={<AddAdvertisement />} />
          <Route path="/dashboard/qr-codes" element={<NotFound />} />
          <Route path="/dashboard/categories" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
