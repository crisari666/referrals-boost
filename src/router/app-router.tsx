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
import NotFound from '@/pages/NotFound';
import ContractSign from '@/pages/ContractSign';
import Schedule from '@/pages/Schedule';
import WhatsAppSync from '@/pages/WhatsAppSync';

const Protected = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const AppRouter = () => (
  <Routes>
    <Route path='/login' element={<Login />} />
    <Route path='/sign' element={<ContractSign />} />
    <Route path='/' element={<Protected><Index /></Protected>} />
    <Route path='/projects' element={<Protected><Projects /></Protected>} />
    <Route path='/projects/:id' element={<Protected><ProjectDetail /></Protected>} />
    <Route path='/clients' element={<Protected><Clients /></Protected>} />
    <Route path='/clients/:id' element={<Protected><ClientDetail /></Protected>} />
    <Route path='/assistant' element={<Protected><Assistant /></Protected>} />
    <Route path='/whatsapp' element={<Protected><WhatsAppSync /></Protected>} />
    <Route path='/schedule' element={<Protected><Schedule /></Protected>} />
    <Route path='/profile' element={<Protected><Profile /></Protected>} />
    <Route path='*' element={<NotFound />} />
  </Routes>
);

export default AppRouter;
