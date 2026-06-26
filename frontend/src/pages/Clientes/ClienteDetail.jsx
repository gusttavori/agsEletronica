import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiUser,
  FiPhone,
  FiMessageCircle,
  FiMail,
  FiMapPin,
  FiEdit2,
  FiArrowLeft,
  FiMonitor,
  FiClipboard,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Card from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ClienteForm from './ClienteForm';
import { clientesApi } from '../../api/clientes';

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: 16px;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const ClientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bgPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  flex-shrink: 0;
`;

const ClientName = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
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

const ListItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ListItemTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ListItemSubtitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ListCard = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

export default function ClienteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('equipamentos');
  const [editOpen, setEditOpen] = useState(false);

  const fetchCliente = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientesApi.getById(id);
      setCliente(data.cliente || data);
    } catch (err) {
      setError('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCliente();
  }, [fetchCliente]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchCliente} />;
  if (!cliente) return <ErrorState message="Cliente não encontrado" />;

  const getInitials = (name) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const tabs = [
    { key: 'equipamentos', label: 'Equipamentos', count: cliente.equipamentos?.length || 0 },
    { key: 'ordensServico', label: 'Ordens de Serviço', count: cliente.ordensServico?.length || 0 },
  ];

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  return (
    <div className="page-enter">
      <BackButton onClick={() => navigate('/clientes')}>
        <FiArrowLeft size={18} />
        Voltar para clientes
      </BackButton>

      <Header>
        <ClientInfo>
          <Avatar>{getInitials(cliente.nome)}</Avatar>
          <div>
            <ClientName>{cliente.nome}</ClientName>
            <span style={{ color: '#A0A0A0', fontSize: '0.875rem' }}>
              Cliente desde {formatDate(cliente.createdAt)}
            </span>
          </div>
        </ClientInfo>
        <Button icon={FiEdit2} variant="secondary" onClick={() => setEditOpen(true)}>
          Editar
        </Button>
      </Header>

      <InfoGrid>
        <InfoCard>
          <InfoIcon><FiPhone size={18} /></InfoIcon>
          <InfoContent>
            <InfoLabel>Telefone</InfoLabel>
            <InfoValue>{cliente.telefone || '-'}</InfoValue>
          </InfoContent>
        </InfoCard>
        <InfoCard>
          <InfoIcon><FiMessageCircle size={18} /></InfoIcon>
          <InfoContent>
            <InfoLabel>WhatsApp</InfoLabel>
            <InfoValue>{cliente.whatsapp || '-'}</InfoValue>
          </InfoContent>
        </InfoCard>
        <InfoCard>
          <InfoIcon><FiMail size={18} /></InfoIcon>
          <InfoContent>
            <InfoLabel>E-mail</InfoLabel>
            <InfoValue>{cliente.email || '-'}</InfoValue>
          </InfoContent>
        </InfoCard>
        <InfoCard>
          <InfoIcon><FiMapPin size={18} /></InfoIcon>
          <InfoContent>
            <InfoLabel>Endereço</InfoLabel>
            <InfoValue>{cliente.endereco || '-'}</InfoValue>
          </InfoContent>
        </InfoCard>
      </InfoGrid>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'equipamentos' && (
        <ListCard>
          {cliente.equipamentos?.length > 0 ? (
            cliente.equipamentos.map((eq) => (
              <ListItem
                key={eq.id}
                onClick={() => navigate(`/equipamentos/${eq.id}`)}
              >
                <ListItemInfo>
                  <ListItemTitle>
                    <FiMonitor size={14} style={{ marginRight: 8 }} />
                    {eq.marca} {eq.modelo}
                  </ListItemTitle>
                  <ListItemSubtitle>
                    {eq.categoria} {eq.numero_serie ? `• S/N: ${eq.numero_serie}` : ''}
                  </ListItemSubtitle>
                </ListItemInfo>
                <Badge variant="primary">{eq.categoria}</Badge>
              </ListItem>
            ))
          ) : (
            <EmptyState
              icon={FiMonitor}
              title="Nenhum equipamento"
              description="Este cliente não possui equipamentos cadastrados."
            />
          )}
        </ListCard>
      )}

      {activeTab === 'ordensServico' && (
        <ListCard>
          {cliente.ordensServico?.length > 0 ? (
            cliente.ordensServico.map((os) => (
              <ListItem
                key={os.id}
                onClick={() => navigate(`/ordens-servico/${os.id}`)}
              >
                <ListItemInfo>
                  <ListItemTitle>
                    <FiClipboard size={14} style={{ marginRight: 8 }} />
                    {os.numero_os}
                  </ListItemTitle>
                  <ListItemSubtitle>
                    {os.defeito_informado?.substring(0, 60) || '-'}
                    {formatDate(os.createdAt) !== '-' ? ` • ${formatDate(os.createdAt)}` : ''}
                  </ListItemSubtitle>
                </ListItemInfo>
                <StatusBadge status={os.status} />
              </ListItem>
            ))
          ) : (
            <EmptyState
              icon={FiClipboard}
              title="Nenhuma ordem de serviço"
              description="Este cliente não possui ordens de serviço."
            />
          )}
        </ListCard>
      )}

      {editOpen && (
        <ClienteForm
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            fetchCliente();
          }}
          cliente={cliente}
        />
      )}
    </div>
  );
}
