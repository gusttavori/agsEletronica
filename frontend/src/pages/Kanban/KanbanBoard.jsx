import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';

import ordensServicoApi from '../../api/ordensServico';

import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';

const BoardWrapper = styled.div`
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding-bottom: 24px;
  min-height: calc(100vh - 200px);
  align-items: flex-start;

  /* Custom Scrollbar for the board */
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.bgSecondary};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 320px;
  max-width: 320px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  overflow: hidden;
`;

const ColumnHeader = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.colors.bgElevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ColumnTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const ColumnCount = styled.span`
  background: ${({ theme }) => theme.colors.bgSecondary};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const ColumnBody = styled.div`
  padding: 16px;
  min-height: 200px;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: background-color 0.2s ease;
  background-color: ${({ $isDraggingOver, theme }) => 
    $isDraggingOver ? theme.colors.bgElevated : 'transparent'};

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
`;

const CardItem = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 16px;
  cursor: pointer;
  box-shadow: ${({ $isDragging, theme }) => 
    $isDragging ? theme.shadows.lg : theme.shadows.sm};
  transition: transform 0.1s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const OsNumber = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CardTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 4px 0;
  line-height: 1.4;
`;

const CardSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 12px 0;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-top: 12px;
  margin-top: 12px;
`;

const DateText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const COLUNAS = [
  { id: 'RECEBIDO', title: 'Recebido' },
  { id: 'EM_DIAGNOSTICO', title: 'Em Diagnóstico' },
  { id: 'AGUARDANDO_APROVACAO', title: 'Aguardando Aprovação' },
  { id: 'EM_REPARO', title: 'Em Reparo' },
  { id: 'PRONTO', title: 'Pronto' },
  { id: 'ENTREGUE', title: 'Entregue' }
];

const PRIORIDADES = {
  BAIXA: { label: 'Baixa', color: 'info' },
  NORMAL: { label: 'Normal', color: 'success' },
  ALTA: { label: 'Alta', color: 'warning' },
  URGENTE: { label: 'Urgente', color: 'danger' },
};

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [columnsData, setColumnsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // MUDANÇA 1: Usando getAll() em vez de getKanban()
      // Se sua api tiver getKanban e ele retornar um array, isso também vai funcionar.
      const response = await ordensServicoApi.getAll();
      
      // Extraindo o array de dados (protegendo contra diferentes formatos de resposta)
      const ordens = response?.data?.data || response?.data || response || [];
      
      let grouped = {
        RECEBIDO: [],
        EM_DIAGNOSTICO: [],
        AGUARDANDO_APROVACAO: [],
        EM_REPARO: [],
        PRONTO: [],
        ENTREGUE: []
      };

      // MUDANÇA 2: Iterando pelo array para jogar cada OS na coluna do status dela
      if (Array.isArray(ordens)) {
        ordens.forEach(os => {
          // Se o status da OS existir no nosso objeto grouped, a gente insere
          if (grouped[os.status]) {
            grouped[os.status].push(os);
          } else {
            // Prevenção: caso venha um status que não mapemanos, joga no Recebido
            grouped.RECEBIDO.push(os);
          }
        });
      }

      setColumnsData(grouped);
    } catch (err) {
      setError('Erro ao carregar os dados do Kanban.');
      toast.error('Erro ao carregar Kanban');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;
    
    // Backup for optimistic update
    const previousColumnsData = { ...columnsData };
    
    // Create new arrays
    const newSourceArr = Array.from(columnsData[sourceCol] || []);
    const newDestArr = sourceCol === destCol ? newSourceArr : Array.from(columnsData[destCol] || []);
    
    // Remove from source
    const [movedItem] = newSourceArr.splice(source.index, 1);
    movedItem.status = destCol; // Update status locally
    
    // Insert into destination
    newDestArr.splice(destination.index, 0, movedItem);

    // Update state optimistically
    setColumnsData((prev) => ({
      ...prev,
      [sourceCol]: newSourceArr,
      [destCol]: newDestArr
    }));

    // If moved to a different column, update in the backend
    if (sourceCol !== destCol) {
      try {
        await ordensServicoApi.updateStatus(draggableId, destCol, 'Status atualizado via Kanban');
        toast.success(`OS movida para ${COLUNAS.find(c => c.id === destCol)?.title || destCol}`);
      } catch (err) {
        toast.error('Erro ao atualizar status. Revertendo ação.');
        // Revert to backup
        setColumnsData(previousColumnsData);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) return <LoadingSpinner center size="lg" />;
  if (error) return <ErrorState title="Erro no Kanban" message={error} onRetry={loadData} />;

  return (
    <div>
      <PageHeader 
        title="Quadro Kanban" 
        subtitle="Acompanhe o fluxo das Ordens de Serviço arrastando os cards."
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <BoardWrapper>
          {COLUNAS.map((col) => {
            const columnItems = columnsData[col.id] || [];
            return (
              <Column key={col.id}>
                <ColumnHeader>
                  <ColumnTitle>{col.title}</ColumnTitle>
                  <ColumnCount>{columnItems.length}</ColumnCount>
                </ColumnHeader>
                
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <ColumnBody
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      $isDraggingOver={snapshot.isDraggingOver}
                    >
                      {columnItems.map((os, index) => {
                        const p = PRIORIDADES[os.prioridade] || PRIORIDADES.NORMAL;
                        return (
                          <Draggable key={os.id.toString()} draggableId={os.id.toString()} index={index}>
                            {(providedDrag, snapshotDrag) => (
                              <CardItem
                                ref={providedDrag.innerRef}
                                {...providedDrag.draggableProps}
                                {...providedDrag.dragHandleProps}
                                $isDragging={snapshotDrag.isDragging}
                                onClick={() => navigate(`/ordens-servico/${os.id}`)}
                                style={{
                                  ...providedDrag.draggableProps.style,
                                }}
                              >
                                <CardHeader>
                                  <OsNumber>{os.numeroOs || os.numero_os}</OsNumber>
                                  <Badge variant={p.color}>{p.label}</Badge>
                                </CardHeader>
                                
                                <CardTitle>{os.cliente?.nome || 'Cliente não informado'}</CardTitle>
                                <CardSubtitle>
                                  {os.equipamento?.marca} {os.equipamento?.modelo}
                                </CardSubtitle>
                                
                                <CardFooter>
                                  <StatusBadge status={os.status} />
                                  <DateText>{formatDate(os.dataEntrada || os.createdAt)}</DateText>
                                </CardFooter>
                              </CardItem>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </ColumnBody>
                  )}
                </Droppable>
              </Column>
            );
          })}
        </BoardWrapper>
      </DragDropContext>
    </div>
  );
}