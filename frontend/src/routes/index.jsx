import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';

// Wrappers
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

// Pages
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';

import ClientesList from '../pages/Clientes/ClientesList';
import ClienteForm from '../pages/Clientes/ClienteForm';
import ClienteDetail from '../pages/Clientes/ClienteDetail';

import EquipamentosList from '../pages/Equipamentos/EquipamentosList';
import EquipamentoForm from '../pages/Equipamentos/EquipamentoForm';
import EquipamentoDetail from '../pages/Equipamentos/EquipamentoDetail';

import OrdensList from '../pages/OrdensServico/OrdensList';
import OrdemForm from '../pages/OrdensServico/OrdemForm';
import OrdemDetail from '../pages/OrdensServico/OrdemDetail';
import KanbanBoard from '../pages/Kanban/KanbanBoard';
import DefeitosList from '../pages/BancoDefeitos/DefeitosList';
import DefeitoForm from '../pages/BancoDefeitos/DefeitoForm';
import DefeitoDetail from '../pages/BancoDefeitos/DefeitoDetail';

// IMPORTAÇÕES DA ADMINISTRAÇÃO E FINANCEIRO
import Auditoria from '../pages/Auditoria/Auditoria'; // Ou Auditoria, como você renomeou
import FinanceiroDashboard from '../pages/Financeiro/FinanceiroDashboard';

import ErrorState from '../components/ui/ErrorState';

const NotFound = () => (
  <div style={{ padding: 40, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <ErrorState title="404 - Não Encontrado" message="A página que você tentou acessar não existe." />
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Clientes - ADMIN, ATENDENTE, TECNICO */}
        <Route path="clientes" element={<RoleGuard allowedRoles={['ADMIN', 'ATENDENTE', 'TECNICO']}><ClientesList /></RoleGuard>} />
        <Route path="clientes/novo" element={<RoleGuard allowedRoles={['ADMIN', 'ATENDENTE']}><ClienteForm /></RoleGuard>} />
        <Route path="clientes/:id" element={<RoleGuard allowedRoles={['ADMIN', 'ATENDENTE', 'TECNICO']}><ClienteDetail /></RoleGuard>} />

        {/* Equipamentos - ADMIN, TECNICO */}
        <Route path="equipamentos" element={<RoleGuard allowedRoles={['ADMIN', 'TECNICO']}><EquipamentosList /></RoleGuard>} />
        <Route path="equipamentos/novo" element={<RoleGuard allowedRoles={['ADMIN', 'TECNICO']}><EquipamentoForm /></RoleGuard>} />
        <Route path="equipamentos/:id" element={<RoleGuard allowedRoles={['ADMIN', 'TECNICO']}><EquipamentoDetail /></RoleGuard>} />

        {/* Ordens de Serviço - ADMIN, ATENDENTE, TECNICO */}
        <Route path="ordens-servico" element={<RoleGuard allowedRoles={['ADMIN', 'ATENDENTE', 'TECNICO']}><OrdensList /></RoleGuard>} />
        <Route path="ordens-servico/nova" element={<RoleGuard allowedRoles={['ADMIN', 'ATENDENTE']}><OrdemForm /></RoleGuard>} />
        <Route path="ordens-servico/:id/editar" element={<RoleGuard allowedRoles={['ADMIN', 'ATENDENTE', 'TECNICO']}><OrdemForm /></RoleGuard>} />
        <Route path="ordens-servico/:id" element={<RoleGuard allowedRoles={['ADMIN', 'ATENDENTE', 'TECNICO']}><OrdemDetail /></RoleGuard>} />

        {/* Kanban - ADMIN, TECNICO */}
        <Route path="kanban" element={<RoleGuard allowedRoles={['ADMIN', 'TECNICO']}><KanbanBoard /></RoleGuard>} />

        {/* Banco de Defeitos - ADMIN, TECNICO */}
        <Route path="banco-defeitos" element={<RoleGuard allowedRoles={['ADMIN', 'TECNICO']}><DefeitosList /></RoleGuard>} />
        <Route path="banco-defeitos/novo" element={<RoleGuard allowedRoles={['ADMIN', 'TECNICO']}><DefeitoForm /></RoleGuard>} />
        <Route path="banco-defeitos/:id" element={<RoleGuard allowedRoles={['ADMIN', 'TECNICO']}><DefeitoDetail /></RoleGuard>} />
        
        {/* Administração & Financeiro - APENAS ADMIN */}
        <Route path="auditoria" element={<RoleGuard allowedRoles={['ADMIN']}><Auditoria /></RoleGuard>} />
        <Route path="financeiro" element={<RoleGuard allowedRoles={['ADMIN']}><FinanceiroDashboard /></RoleGuard>} />
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}