import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiEdit2, FiPrinter, FiArrowLeft, FiCamera, FiPlus, FiFileText, FiX, FiBookOpen, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

import ordensServicoApi from '../../api/ordensServico';
import orcamentoApi from '../../api/orcamento';
import equipamentosApi from '../../api/equipamentos';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Timeline from '../../components/ui/Timeline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import Table from '../../components/ui/Table';

import OrcamentoForm from '../Orcamento/OrcamentoForm';
import { OrcamentoTemplate } from '../../components/pdf/OrcamentoTemplate';

// --- ESTILOS MANTIDOS ---
const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  margin-bottom: 24px;
  overflow-x: auto;
  
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${({ $active }) => $active ? '#FFD100' : 'transparent'};
  color: ${({ $active }) => $active ? '#FFD100' : '#9ca3af'};
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: ${({ $active }) => $active ? '#FFD100' : '#e5e7eb'};
  }
`;

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

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    button { flex: 1; justify-content: center; }
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const Section = styled.div`
  margin-top: 16px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-bottom: 8px;
`;

const TextBlock = styled.div`
  background: ${({ theme }) => theme.colors.bgElevated};
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: pre-wrap;
  min-height: 80px;
`;

const OrcamentoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const OrcamentoTotal = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.bgElevated};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const EmptyPhotos = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
  background: ${({ theme }) => theme.colors.bgElevated};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
`;

// --- NOVOS ESTILOS PARA FOTOS ---
const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const PhotoCard = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const DeletePhotoButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;

  ${PhotoCard}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 1; /* Sempre visível no mobile */
  }

  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadActionArea = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const PRIORIDADES = {
  BAIXA: { label: 'Baixa', color: 'info' },
  NORMAL: { label: 'Normal', color: 'success' },
  ALTA: { label: 'Alta', color: 'warning' },
  URGENTE: { label: 'Urgente', color: 'danger' },
};

export default function OrdemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [os, setOs] = useState(null);
  const [orcamento, setOrcamento] = useState([]);
  const [fotos, setFotos] = useState([]); // <-- Estado para as fotos
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isOrcamentoModalOpen, setIsOrcamentoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('detalhes');

  const orcamentoPdfRef = useRef(null);
  const fileInputRef = useRef(null);

  const handlePrintOS = useReactToPrint({
    contentRef: orcamentoPdfRef,
    documentTitle: `OS_${os?.numeroOs || 'AGS'}`,
    onAfterPrint: () => toast.success('Ordem de Serviço gerada com sucesso!'),
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [osResponse, orcamentoResponse] = await Promise.all([
        ordensServicoApi.getById(id),
        orcamentoApi.getByOrdemServico(id).catch(() => []),
      ]);
      
      const osData = osResponse.data?.data || osResponse.data || osResponse;
      const orcamentoData = orcamentoResponse.data?.data || orcamentoResponse.data || orcamentoResponse || [];
      
      setOs(osData);
      
      const todasAsFotos = osData.equipamento?.fotos || [];
      const fotosValidas = todasAsFotos.filter(foto => foto.url.startsWith('/uploads'));
      
      setFotos(fotosValidas);
      
      setOrcamento(Array.isArray(orcamentoData) ? orcamentoData : []);

    } catch (err) {
      setError('Não foi possível carregar a Ordem de Serviço.');
      toast.error('OS não encontrada');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

 const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('foto', file);
      
      // Chamada REAL para a API do Backend
      const response = await equipamentosApi.uploadFoto(os.equipamentoId, formData);
      const novaFoto = response?.data || response;
      
      setFotos((prev) => [...prev, novaFoto]);
      toast.success('Foto adicionada com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar a foto.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

    const handleDeletePhoto = async (fotoId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto?')) return;
    
    try {
      // Pega o ID com segurança
      const idDoEquipamento = os.equipamento?.id || os.equipamentoId;
      
      await equipamentosApi.deleteFoto(idDoEquipamento, fotoId);
      
      setFotos((prev) => prev.filter(f => f.id !== fotoId));
      toast.success('Foto excluída.');
    } catch (error) {
      toast.error('Erro ao excluir foto.');
    }
  };

  if (loading) return <LoadingSpinner center size="lg" />;
  if (error || !os) return <ErrorState title="Erro" message={error} onRetry={() => navigate('/ordens-servico')} />;

  const p = PRIORIDADES[os.prioridade] || PRIORIDADES.NORMAL;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const orcamentoColumns = [
    { field: 'tipo', header: 'Tipo', render: (row) => row.tipo === 'PECA' ? 'Peça' : 'Mão de Obra' },
    { field: 'descricao', header: 'Descrição' },
    { field: 'quantidade', header: 'Qtd' },
    { field: 'valorUnitario', header: 'Valor Un.', render: (row) => `R$ ${parseFloat(row.valorUnitario).toFixed(2)}` },
    { field: 'subtotal', header: 'Subtotal', render: (row) => `R$ ${parseFloat(row.valorUnitario * row.quantidade).toFixed(2)}` },
  ];

  const totalOrcamento = orcamento.length > 0 
    ? orcamento.reduce((acc, item) => acc + (parseFloat(item.valorUnitario) * parseInt(item.quantidade, 10)), 0)
    : parseFloat(os.valorTotal || 0);

  const historicoItems = (os.historico || []).map(h => ({
    id: h.id,
    title: h.statusNovo,
    description: h.descricao,
    time: formatDate(h.createdAt),
    status: h.statusNovo === 'ENTREGUE' ? 'success' : 'primary'
  }));

  const tabs = [
    {
      id: 'detalhes',
      label: 'Detalhes Técnicos',
      content: (
        <>
          <Section>
            <SectionTitle>Defeito Informado (Cliente)</SectionTitle>
            <TextBlock>{os.defeitoInformado || 'Nenhum defeito informado.'}</TextBlock>
          </Section>
          <Section>
            <SectionTitle>Diagnóstico Técnico</SectionTitle>
            <TextBlock>{os.diagnostico || 'Diagnóstico ainda não realizado.'}</TextBlock>
          </Section>
          <Section>
            <SectionTitle>Solução Aplicada</SectionTitle>
            <TextBlock>{os.solucao || 'Nenhuma solução registrada.'}</TextBlock>
          </Section>
        </>
      ),
    },
    {
      id: 'orcamento',
      label: 'Orçamento',
      content: (
        <OrcamentoWrapper>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <SectionTitle style={{ marginBottom: 0, border: 'none' }}>Itens do Orçamento</SectionTitle>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                variant="primary" 
                style={{ backgroundColor: '#FFD100', color: '#000', fontWeight: 'bold' }} 
                onClick={() => setIsOrcamentoModalOpen(true)}
              >
                <FiEdit2 style={{ marginRight: '8px' }} /> Editar Itens
              </Button>
            </div>
            
          </div>
          <div style={{ overflowX: 'auto' }}>
            <Table 
              columns={orcamentoColumns} 
              data={orcamento} 
              emptyMessage="Nenhum item adicionado ao orçamento ainda."
            />
          </div>
          <OrcamentoTotal>
            <span>Total:</span>
            <span>R$ {parseFloat(totalOrcamento).toFixed(2)}</span>
          </OrcamentoTotal>
        </OrcamentoWrapper>
      ),
    },
    {
      id: 'historico',
      label: 'Histórico',
      content: (
        <Section>
          {historicoItems.length > 0 ? (
            <Timeline items={historicoItems} />
          ) : (
            <TextBlock>Nenhum histórico registrado.</TextBlock>
          )}
        </Section>
      ),
    },
    {
      id: 'fotos',
      label: 'Fotos',
      content: (
        <Section>
          <HiddenInput 
            type="file" 
            accept="image/*" 
            capture="environment" // Habilita a câmera do celular nativamente
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />

          {fotos.length > 0 ? (
            <>
              <UploadActionArea>
                <Button isLoading={uploading} onClick={() => fileInputRef.current.click()}>
                  <FiCamera style={{ marginRight: '8px' }} /> Tirar Nova Foto
                </Button>
              </UploadActionArea>
              
              <PhotoGrid>
                {fotos.map((foto) => (
                  <PhotoCard key={foto.id}>
                    <img src={foto.url} alt="Equipamento" />
                    <DeletePhotoButton
                      onClick={() => handleDeletePhoto(foto.id)} 
                      title="Excluir Foto"
                      >
                      <FiTrash2 size={16} />
                    </DeletePhotoButton>
                  </PhotoCard>
                ))}
              </PhotoGrid>
            </>
          ) : (
            <EmptyPhotos>
              <FiCamera size={48} />
              <p>Nenhuma foto anexada a este equipamento.</p>
              <Button isLoading={uploading} onClick={() => fileInputRef.current.click()}>
                <FiCamera style={{ marginRight: '8px' }}/> Registrar Estado do Aparelho
              </Button>
            </EmptyPhotos>
          )}
        </Section>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Ordem de Serviço: ${os.numeroOs}`}
        subtitle={`Criada em ${formatDate(os.createdAt)}`}
      >
        <HeaderActions>
          <Button variant="ghost" onClick={() => navigate('/ordens-servico')}>
            <FiArrowLeft /> Voltar
          </Button>
          
        {os.status === 'PRONTO' || os.status === 'ENTREGUE' ? (
            <Button 
              variant="outline" 
              onClick={() => navigate('/banco-defeitos/novo', {
                state: {
                  osData: {
                    marca: os.equipamento?.marca || '',
                    modelo: os.equipamento?.modelo || '',
                    sintoma: os.defeitoInformado || '',
                    diagnostico: os.diagnostico || '',
                    solucao: os.solucao || '',
                    ordemServicoId: os.id,
                    numeroOs: os.numeroOs
                  }
                }
              })}
            >
              <FiBookOpen /> Catalogar Defeito
            </Button>
          ) : null}

          <Button 
            variant="outline" 
            onClick={() => handlePrintOS()}
          >
            <FiPrinter /> Imprimir OS
          </Button>

          <Button onClick={() => navigate(`/ordens-servico/${os.id}/editar`)}>
            <FiEdit2 /> Editar OS
          </Button>

          <Button variant="primary" style={{ backgroundColor: '#FFD100', color: '#000', fontWeight: 'bold' }} onClick={() => setIsOrcamentoModalOpen(true)}>
            <FiFileText size={18} style={{ marginRight: '8px' }}/> 
            Gerar Orçamento
          </Button>
        </HeaderActions>
      </PageHeader>

      <Card style={{ marginBottom: 24 }}>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Status</InfoLabel>
            <InfoValue><StatusBadge status={os.status} /></InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Prioridade</InfoLabel>
            <InfoValue><Badge variant={p.color}>{p.label}</Badge></InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Cliente</InfoLabel>
            <InfoValue>{os.cliente?.nome || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Telefone</InfoLabel>
            <InfoValue>{os.cliente?.telefone || os.cliente?.whatsapp || 'N/A'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Equipamento</InfoLabel>
            <InfoValue>{`${os.equipamento?.marca || ''} ${os.equipamento?.modelo || ''}`}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Nº Série</InfoLabel>
            <InfoValue>{os.equipamento?.numeroSerie || 'N/A'}</InfoValue>
          </InfoItem>
        </InfoGrid>
      </Card>

      <Card>
        <TabHeader>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabHeader>
        
        <div>
          {tabs.find((t) => t.id === activeTab)?.content}
        </div>
      </Card>

      {/* MODAL DE ORÇAMENTO */}
      {isOrcamentoModalOpen && (
        <ModalOverlay onClick={() => setIsOrcamentoModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setIsOrcamentoModalOpen(false)} title="Fechar">
              <FiX size={20} />
            </CloseButton>
            
            <OrcamentoForm 
              ordemServico={os}
              itensIniciais={orcamento}
              onSuccess={(novosItens) => {
                setOrcamento(novosItens);
                setActiveTab('orcamento');
                setIsOrcamentoModalOpen(false);
                fetchData();
              }}
            />
          </ModalContent>
        </ModalOverlay>
      )}

     {/* TEMPLATE OCULTO PARA IMPRESSÃO */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <div ref={orcamentoPdfRef}>
          <OrcamentoTemplate ordem={os} itens={orcamento} />
        </div>
      </div>

    </div>
  );
}