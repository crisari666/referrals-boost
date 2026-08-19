import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Assistant } from '@/features/Assistant';
import { Clients, ClientDetail } from '@/features/Clients';
import { Profile } from '@/features/Profile';
import { ProjectDetail, Projects } from '@/features/Projects';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import FirstAccess from '@/pages/FirstAccess';
import AppInfo from '@/pages/AppInfo';
import Privacy from '@/pages/Privacy';
import NotFound from '@/pages/NotFound';
import ContractSign from '@/pages/ContractSign';
import Schedule from '@/pages/Schedule';
import WhatsAppSync from '@/pages/WhatsAppSync';
import { SignupCampaignPage } from '@/features/signup-campaign';
import { TrainingSessionsPage } from '@/features/training-sessions/pages/training-sessions-page';
import { LotStockHubPage } from '@/features/lot-stock/pages/lot-stock-hub-page';
import { LotStockPage } from '@/features/lot-stock/pages/lot-stock-page';
import { StockLayoutRoute } from '@/features/lot-stock/pages/stock-layout-route';

const Protected = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const AppRouter = () => (
  <Routes>
    <Route path='/login' element={<Login />} />
    <Route path='/first-access' element={<FirstAccess />} />
    <Route path='/sign' element={<ContractSign />} />
    <Route path='/signup' element={<SignupCampaignPage />} />
    <Route path='/app-info' element={<AppInfo />} />
    <Route path='/privacy' element={<Privacy />} />
    <Route
      path='/stock'
      element={
        <StockLayoutRoute>
          <LotStockHubPage />
        </StockLayoutRoute>
      }
    />
    <Route
      path='/stock/:projectId'
      element={
        <StockLayoutRoute>
          <LotStockPage />
        </StockLayoutRoute>
      }
    />
    <Route path='/' element={<Protected><Index /></Protected>} />
    <Route path='/projects' element={<Protected><Projects /></Protected>} />
    <Route path='/projects/:id' element={<Protected><ProjectDetail /></Protected>} />
    <Route path='/clients' element={<Protected><Clients /></Protected>} />
    <Route path='/clients/:id' element={<Protected><ClientDetail /></Protected>} />
    <Route path='/assistant' element={<Protected><Assistant /></Protected>} />
    <Route path='/whatsapp' element={<Protected><WhatsAppSync /></Protected>} />
    <Route path='/schedule' element={<Protected><Schedule /></Protected>} />
    <Route path='/profile' element={<Protected><Profile /></Protected>} />
    <Route path='/training-sessions' element={<Protected><TrainingSessionsPage /></Protected>} />
    <Route path='*' element={<NotFound />} />
  </Routes>
);

export default AppRouter;
