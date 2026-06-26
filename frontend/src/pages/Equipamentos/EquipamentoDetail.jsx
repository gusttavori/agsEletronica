import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  FiArrowLeft,
  FiEdit2,
  FiMonitor,
  FiUser,
  FiHash,
  FiCamera,
  FiTrash2,
  FiUpload,
  FiClipboard,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EquipamentoForm from './EquipamentoForm';
import { equipamentosApi } from '../../api/equipamentos';

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

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const InfoCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
`;

const PhotoCard = styled.div`
  position: relative;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  aspect-ratio: 4 / 3;
  background: ${({ theme }) => theme.colors.bgElevated};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DeletePhotoButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: ${({ theme }) => theme.colors.danger};
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.fast};

  ${PhotoCard}:hover & {
    opacity: 1;
  }
`;

const UploadArea = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  aspect-ratio: 4 / 3;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  input {
    display: none;
  }
`;

const OSList = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const OSItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.bgElevated}; }
`;

const OSInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OSTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const OSSub = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export default function EquipamentoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipamento, setEquipamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchEquipamento = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await equipamentosApi.getById(id);
      setEquipamento(data.equipamento || data);
    } catch (err) {
      setError('Erro ao carregar equipamento');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEquipamento();
  }, [fetchEquipamento]);

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    setUploading(true);
    try {
      await equipamentosApi.uploadFoto(id, formData);
      toast.success('Foto enviada com sucesso');
      fetchEquipamento();
    } catch {
      toast.error('Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFoto = async (fotoId) => {
    try {
      await equipamentosApi.removeFoto(fotoId);
      toast.success('Foto excluída');
      fetchEquipamento();
    } catch {
      toast.error('Erro ao excluir foto');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchEquipamento} />;
  if (!equipamento) return <ErrorState message="Equipamento não encontrado" />;

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  return (
    <div className="page-enter">
      <BackButton onClick={() => navigate('/equipamentos')}>
        <FiArrowLeft size={18} />
        Voltar para equipamentos
      </BackButton>

      <Header>
        <HeaderInfo>
          <Title>
            <FiMonitor />
            {equipamento.marca} {equipamento.modelo}
          </Title>
          <MetaInfo>
            <MetaItem>
              <Badge variant="primary">{equipamento.categoria}</Badge>
            </MetaItem>
            {equipamento.numero_serie && (
              <MetaItem>
                <FiHash size={14} />
                {equipamento.numero_serie}
              </MetaItem>
            )}
            {equipamento.cliente && (
              <MetaItem>
                <FiUser size={14} />
                {equipamento.cliente.nome}
              </MetaItem>
            )}
          </MetaInfo>
        </HeaderInfo>
        <Button icon={FiEdit2} variant="secondary" onClick={() => setEditOpen(true)}>
          Editar
        </Button>
      </Header>

      <InfoGrid>
        <InfoCard>
          <InfoLabel>Categoria</InfoLabel>
          <InfoValue>{equipamento.categoria}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>Marca</InfoLabel>
          <InfoValue>{equipamento.marca}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>Modelo</InfoLabel>
          <InfoValue>{equipamento.modelo}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>Nº Série</InfoLabel>
          <InfoValue>{equipamento.numero_serie || '-'}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>Cliente</InfoLabel>
          <InfoValue>{equipamento.cliente?.nome || '-'}</InfoValue>
        </InfoCard>
        <InfoCard>
          <InfoLabel>Data de Entrada</InfoLabel>
          <InfoValue>{formatDate(equipamento.createdAt)}</InfoValue>
        </InfoCard>
      </InfoGrid>

      {equipamento.observacoes && (
        <Section>
          <SectionTitle>Observações</SectionTitle>
          <Card>
            <p style={{ fontSize: '0.875rem', color: '#A0A0A0', lineHeight: 1.6 }}>
              {equipamento.observacoes}
            </p>
          </Card>
        </Section>
      )}

      <Section>
        <SectionTitle>
          <FiCamera />
          Fotos
        </SectionTitle>
        <PhotoGrid>
          {equipamento.fotos?.map((foto) => (
            <PhotoCard key={foto.id}>
              <img src={foto.url || `/uploads/${foto.filename}`} alt="Foto do equipamento" />
              <DeletePhotoButton onClick={() => handleDeleteFoto(foto.id)}>
                <FiTrash2 size={14} />
              </DeletePhotoButton>
            </PhotoCard>
          ))}
          <UploadArea>
            <FiUpload size={24} />
            <span>{uploading ? 'Enviando...' : 'Adicionar foto'}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadFoto}
              disabled={uploading}
            />
          </UploadArea>
        </PhotoGrid>
      </Section>

      <Section>
        <SectionTitle>
          <FiClipboard />
          Ordens de Serviço
        </SectionTitle>
        <OSList>
          {equipamento.ordensServico?.length > 0 ? (
            equipamento.ordensServico.map((os) => (
              <OSItem key={os.id} onClick={() => navigate(`/ordens-servico/${os.id}`)}>
                <OSInfo>
                  <OSTitle>{os.numero_os}</OSTitle>
                  <OSSub>
                    {os.defeito_informado?.substring(0, 60) || '-'}
                    {' • '}
                    {formatDate(os.createdAt)}
                  </OSSub>
                </OSInfo>
                <StatusBadge status={os.status} />
              </OSItem>
            ))
          ) : (
            <EmptyState
              icon={FiClipboard}
              title="Nenhuma OS"
              description="Nenhuma ordem de serviço para este equipamento."
            />
          )}
        </OSList>
      </Section>

      {editOpen && (
        <EquipamentoForm
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            fetchEquipamento();
          }}
          equipamento={equipamento}
        />
      )}
    </div>
  );
}
