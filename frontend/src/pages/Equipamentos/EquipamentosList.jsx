import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EquipamentoForm from './EquipamentoForm';
import { equipamentosApi } from '../../api/equipamentos';
import { usePagination } from '../../hooks/usePagination';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const Filters = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterSelect = styled(Select)`
  width: 160px;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 4px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ $danger, theme }) =>
      $danger ? theme.colors.danger : theme.colors.primary};
  }
`;

const CATEGORIAS = [
  'TV',
  'Monitor',
  'Notebook',
  'Desktop',
  'Celular',
  'Tablet',
  'Console',
  'Impressora',
  'Outro',
];

export default function EquipamentosList() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const pagination = usePagination(1, 10);

  const fetchEquipamentos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await equipamentosApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
        categoria: categoria || undefined,
      });
      setEquipamentos(data.data || data.equipamentos || []);
      pagination.setTotal(data.total || 0);
    } catch (error) {
      toast.error('Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, categoria]);

  useEffect(() => {
    fetchEquipamentos();
  }, [fetchEquipamentos]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    pagination.resetPage();
  }, [pagination]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await equipamentosApi.remove(deleteId);
      toast.success('Equipamento excluído com sucesso');
      setDeleteId(null);
      fetchEquipamentos();
    } catch (error) {
      toast.error('Erro ao excluir equipamento');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingItem(null);
    fetchEquipamentos();
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const getCategoriaVariant = (cat) => {
    const map = {
      TV: 'info',
      Monitor: 'info',
      Notebook: 'purple',
      Desktop: 'primary',
      Celular: 'success',
      Tablet: 'warning',
      Console: 'orange',
      Impressora: 'gray',
    };
    return map[cat] || 'default';
  };

  const columns = [
    {
      field: 'categoria',
      header: 'Categoria',
      render: (row) => <Badge variant={getCategoriaVariant(row.categoria)}>{row.categoria}</Badge>,
    },
    {
      field: 'marca',
      header: 'Marca',
      sortable: true,
      render: (row) => <span style={{ fontWeight: 500 }}>{row.marca}</span>,
    },
    {
      field: 'modelo',
      header: 'Modelo',
      sortable: true,
    },
    {
      field: 'cliente',
      header: 'Cliente',
      render: (row) => row.cliente?.nome || '-',
    },
    {
      field: 'createdAt',
      header: 'Data Entrada',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'acoes',
      header: 'Ações',
      width: '100px',
      render: (row) => (
        <ActionsCell>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              setEditingItem(row);
              setModalOpen(true);
            }}
          >
            <FiEdit2 size={16} />
          </ActionButton>
          <ActionButton
            $danger
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(row.id);
            }}
          >
            <FiTrash2 size={16} />
          </ActionButton>
        </ActionsCell>
      ),
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Equipamentos" subtitle="Gerencie os equipamentos cadastrados">
        <Button icon={FiPlus} onClick={() => setModalOpen(true)}>
          Novo Equipamento
        </Button>
      </PageHeader>

      <TopBar>
        <SearchInput
          placeholder="Buscar por marca, modelo ou número de série..."
          onSearch={handleSearch}
        />
        <Filters>
          <FilterSelect
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              pagination.resetPage();
            }}
          >
            <option value="">Todas categorias</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </FilterSelect>
        </Filters>
      </TopBar>

      <Table
        columns={columns}
        data={equipamentos}
        loading={loading}
        onRowClick={(row) => navigate(`/equipamentos/${row.id}`)}
        emptyMessage="Nenhum equipamento encontrado"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={pagination.setPage}
      />

      {modalOpen && (
        <EquipamentoForm
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={handleFormSuccess}
          equipamento={editingItem}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Excluir Equipamento"
        message="Tem certeza que deseja excluir este equipamento?"
      />
    </div>
  );
}
