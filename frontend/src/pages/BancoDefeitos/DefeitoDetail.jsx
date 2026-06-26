import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiEdit2, FiArrowLeft, FiCopy, FiInfo, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

import bancoDefeitosApi from '../../api/bancoDefeitos';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SideContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 20px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-bottom: 8px;
`;

const TextBlock = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: pre-wrap;
  line-height: 1.6;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;

const MetaValue = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const AiPlaceholder = styled.div`
  padding: 24px;
  background: rgba(170, 102, 204, 0.05);
  border: 1px dashed rgba(170, 102, 204, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.textMuted};

  svg {
    color: #AA66CC;
    opacity: 0.7;
  }
`;

export default function DefeitoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [defeito, setDefeito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await bancoDefeitosApi.getById(id);
        setDefeito(data);
      } catch (err) {
        setError('Não foi possível carregar as informações deste defeito.');
        toast.error('Registro não encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCopyReference = () => {
    if (!defeito) return;
    const textToCopy = `Referência do Banco de Defeitos #${defeito.id}
Sintoma: ${defeito.sintoma}
Diagnóstico: ${defeito.diagnostico}
Solução Aplicada: ${defeito.solucao}`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => toast.success('Referência copiada para a área de transferência!'))
      .catch(() => toast.error('Erro ao copiar referência'));
  };

  if (loading) return <LoadingSpinner center size="lg" />;
  if (error || !defeito) return <ErrorState title="Erro" message={error} onRetry={() => navigate('/banco-defeitos')} />;

  return (
    <div>
      <PageHeader
        title={`${defeito.marca} ${defeito.modelo}`}
        subtitle="Registro de Base de Conhecimento"
      >
        <HeaderActions>
          <Button variant="ghost" onClick={() => navigate('/banco-defeitos')}>
            <FiArrowLeft /> Voltar
          </Button>
          <Button variant="outline" onClick={handleCopyReference}>
            <FiCopy /> Usar como Referência
          </Button>
          <Button onClick={() => navigate(`/banco-defeitos/${defeito.id}/editar`)}>
            <FiEdit2 /> Editar
          </Button>
        </HeaderActions>
      </PageHeader>

      <ContentGrid>
        <MainContent>
          <Card>
            <SectionTitle><FiInfo /> Sintoma Apresentado</SectionTitle>
            <TextBlock style={{ marginBottom: 24 }}>{defeito.sintoma}</TextBlock>

            <SectionTitle><FiTool /> Diagnóstico Técnico</SectionTitle>
            <TextBlock style={{ marginBottom: 24 }}>{defeito.diagnostico}</TextBlock>

            <SectionTitle><FiCheckCircle /> Solução / Procedimento</SectionTitle>
            <TextBlock>{defeito.solucao}</TextBlock>
          </Card>

          {defeito.pecasUtilizadas && (
            <Card>
              <SectionTitle><FiSettings /> Peças Utilizadas</SectionTitle>
              <TextBlock>{defeito.pecasUtilizadas}</TextBlock>
            </Card>
          )}

          {defeito.observacoes && (
            <Card>
              <SectionTitle>Observações Extras</SectionTitle>
              <TextBlock>{defeito.observacoes}</TextBlock>
            </Card>
          )}
        </MainContent>

        <SideContent>
          <Card>
            <SectionTitle>Ficha Técnica</SectionTitle>
            <MetaGrid>
              <MetaItem>
                <MetaLabel>Marca</MetaLabel>
                <MetaValue>{defeito.marca}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Modelo</MetaLabel>
                <MetaValue>{defeito.modelo}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Categoria</MetaLabel>
                <MetaValue><Badge variant="primary">{defeito.categoria}</Badge></MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Data de Cadastro</MetaLabel>
                <MetaValue>{new Date(defeito.createdAt).toLocaleDateString('pt-BR')}</MetaValue>
              </MetaItem>
              {defeito.ordemServicoId && (
                <MetaItem>
                  <MetaLabel>OS Original Relacionada</MetaLabel>
                  <MetaValue>
                    <a href={`/ordens-servico/${defeito.ordemServicoId}`} style={{ color: '#FFD100', textDecoration: 'underline' }}>
                      Visualizar OS #{defeito.ordemServicoId}
                    </a>
                  </MetaValue>
                </MetaItem>
              )}
            </MetaGrid>
          </Card>

          <AiPlaceholder>
            <FiSearch size={32} />
            <h4 style={{ margin: 0, color: 'inherit' }}>Busca Inteligente</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Em breve: A IA irá sugerir automaticamente "Defeitos Semelhantes" com base no sintoma e diagnóstico relatado neste registro.
            </p>
          </AiPlaceholder>
        </SideContent>
      </ContentGrid>
    </div>
  );
}

// Inline missing icons for quick render
const FiTool = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>;
const FiCheckCircle = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const FiSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
