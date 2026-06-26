import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiInbox,
  FiSearch,
  FiClock,
  FiTool,
  FiCheckCircle,
  FiPackage,
  FiTrendingUp,
  FiFileText,
  FiEye,
  FiX
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import dashboardApi from '../../api/dashboard';
import OrcamentoForm from '../Orcamento/OrcamentoForm';

// --- ESTILOS DO MODAL ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
  animation: fadeIn 0.2s ease;
`;

const ModalContent = styled.div`
  background: transparent;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border-radius: 8px;
  animation: slideUp 0.3s ease;

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 24px;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  color: #475569;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`;

// --- ESTILOS DO DASHBOARD (RESPONSIVOS) ---
const KPIGrid = styled.div`
  display: grid;
  /* Minmax reduzido de 200px para 150px para caber melhor no celular */
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const KPICard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  transition: all ${({ theme }) => theme.transitions.normal};
  cursor: pointer;
  animation: fadeIn 0.3s ease;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  animation-fill-mode: both;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ $color }) => $color}33;
  }
`;

const KPIInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const KPIValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1;
`;

const KPILabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const KPIIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(Card)`
  padding: 24px;
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 20px;
`;

const RecentSection = styled.div`
  margin-top: 8px;
`;

const RecentTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Container novo para permitir rolagem horizontal no celular
const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgCard};

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.borderLight}; border-radius: 4px; }
`;

const RecentTable = styled.div`
  min-width: 800px; /* Força um tamanho mínimo para não espremer os dados no mobile */
  display: flex;
  flex-direction: column;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1.5fr 1.5fr 140px 100px 60px;
  padding: 12px 16px;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: background ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
  }
`;

const TableHeader = styled(TableRow)`
  background: ${({ theme }) => theme.colors.bgSecondary};
  cursor: default;

  &:hover {
    background: ${({ theme }) => theme.colors.bgSecondary};
  }
`;

const TableCell = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ $muted, theme }) =>
    $muted ? theme.colors.textSecondary : theme.colors.textPrimary};
  font-weight: ${({ $bold, theme }) =>
    $bold ? theme.fontWeights.semibold : theme.fontWeights.normal};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableHeaderCell = styled(TableCell)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #FFD100;
    background: rgba(255, 209, 0, 0.1);
  }
`;

const PIE_COLORS = ['#33B5E5', '#FFB300', '#FF8800', '#AA66CC', '#00C851', '#A0A0A0'];

const CustomTooltipWrapper = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 10px 14px;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const TooltipLabel = styled.p`
  font-size: 12px;
  color: #A0A0A0;
  margin-bottom: 4px;
`;

const TooltipValue = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
`;

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <CustomTooltipWrapper>
      <TooltipLabel>{label}</TooltipLabel>
      <TooltipValue>{payload[0].value} serviços</TooltipValue>
    </CustomTooltipWrapper>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <CustomTooltipWrapper>
      <TooltipLabel>{payload[0].name}</TooltipLabel>
      <TooltipValue>{payload[0].value} equipamentos</TooltipValue>
    </CustomTooltipWrapper>
  );
}

const kpiItems = [
  { key: 'recebidos', label: 'Recebidos', icon: FiInbox, color: '#33B5E5', status: 'RECEBIDO' },
  { key: 'emDiagnostico', label: 'Em Diagnóstico', icon: FiSearch, color: '#FFB300', status: 'EM_DIAGNOSTICO' },
  { key: 'aguardandoAprovacao', label: 'Aguardando Aprovação', icon: FiClock, color: '#FF8800', status: 'AGUARDANDO_APROVACAO' },
  { key: 'emReparo', label: 'Em Reparo', icon: FiTool, color: '#AA66CC', status: 'EM_REPARO' },
  { key: 'prontos', label: 'Prontos', icon: FiCheckCircle, color: '#00C851', status: 'PRONTO' },
  { key: 'entregues', label: 'Entregues', icon: FiPackage, color: '#A0A0A0', status: 'ENTREGUE' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orcamentoModalOs, setOrcamentoModalOs] = useState(null);
  
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardApi.getStats();
      const estatisticas = response?.data?.data || response?.data || response;
      setStats(estatisticas);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchStats} />;

  const statusCounts = stats?.statusCounts || {};
  const categoriaData = stats?.categoriaData || [];
  const equipamentosPorStatus = stats?.equipamentosPorStatus || [];
  const recentOrders = stats?.recentOrders || [];

  function formatDate(dateStr) {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr || '-';
    }
  }

  const openOrcamentoModal = (e, order) => {
    e.stopPropagation();
    setOrcamentoModalOs(order);
  };

  const closeOrcamentoModal = () => {
    setOrcamentoModalOs(null);
  };

  return (
    <div className="page-enter relative">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do sistema"
      />

      <KPIGrid>
        {kpiItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <KPICard
              key={item.key}
              $color={item.color}
              $delay={`${index * 0.05}s`}
              onClick={() => navigate('/ordens-servico', { state: { statusFilter: item.status } })}
            >
              <KPIInfo>
                <KPIValue>{statusCounts[item.key] || 0}</KPIValue>
                <KPILabel>{item.label}</KPILabel>
              </KPIInfo>
              <KPIIconWrapper $color={item.color}>
                <Icon size={22} />
              </KPIIconWrapper>
            </KPICard>
          );
        })}
      </KPIGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Serviços por Categoria</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoriaData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis
                dataKey="categoria"
                tick={{ fill: '#A0A0A0', fontSize: 12 }}
                axisLine={{ stroke: '#333333' }}
              />
              <YAxis
                tick={{ fill: '#A0A0A0', fontSize: 12 }}
                axisLine={{ stroke: '#333333' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="total" fill="#FFD100" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Equipamentos por Status</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={equipamentosPorStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {equipamentosPorStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#A0A0A0' }}
                formatter={(value) => (
                  <span style={{ color: '#A0A0A0' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <RecentSection>
        <RecentTitle>
          <FiTrendingUp size={20} />
          Ordens Recentes
        </RecentTitle>
        <TableWrapper>
          <RecentTable>
            <TableHeader>
              <TableHeaderCell>Nº OS</TableHeaderCell>
              <TableHeaderCell>Cliente</TableHeaderCell>
              <TableHeaderCell>Equipamento</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Data</TableHeaderCell>
              <TableHeaderCell style={{ textAlign: 'center' }}>Ação</TableHeaderCell>
            </TableHeader>
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 10).map((order) => {
                const temOrcamento = order.orcamentos?.length > 0 || order.orcamento || order.temOrcamento || Number(order.valorTotal) > 0;

                return (
                  <TableRow
                    key={order.id}
                    onClick={() => navigate(`/ordens-servico/${order.id}`)}
                  >
                    <TableCell $bold>{order.numero_os || order.numeroOs}</TableCell>
                    <TableCell>{order.cliente?.nome || '-'}</TableCell>
                    <TableCell $muted>
                      {order.equipamento
                        ? `${order.equipamento.marca} ${order.equipamento.modelo}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell $muted>{formatDate(order.createdAt)}</TableCell>
                    <TableCell style={{ display: 'flex', justifyContent: 'center' }}>
                      
                      {temOrcamento ? (
                        <ActionButton 
                          title="Ver Orçamento"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ordens-servico/${order.id}`);
                          }}
                        >
                          <FiEye size={18} />
                        </ActionButton>
                      ) : (
                        <ActionButton 
                          title="Gerar Orçamento / PDF"
                          onClick={(e) => openOrcamentoModal(e, order)}
                        >
                          <FiFileText size={18} />
                        </ActionButton>
                      )}

                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow style={{ cursor: 'default' }}>
                <TableCell $muted style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                  Nenhuma ordem de serviço encontrada
                </TableCell>
              </TableRow>
            )}
          </RecentTable>
        </TableWrapper>
      </RecentSection>

      {/* MODAL DE ORÇAMENTO */}
      {orcamentoModalOs && (
        <ModalOverlay onClick={closeOrcamentoModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={closeOrcamentoModal} title="Fechar">
              <FiX size={20} />
            </CloseButton>
            
            <OrcamentoForm ordemServico={orcamentoModalOs} />
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
}