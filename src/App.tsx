import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Profile from "./pages/Profile";
import Assistant from "./pages/Assistant";
import WhatsAppSync from "./pages/WhatsAppSync";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/whatsapp" element={<WhatsAppSync />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
