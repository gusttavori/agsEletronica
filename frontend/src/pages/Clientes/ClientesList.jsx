import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiPhone, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import SearchInput from '../../components/ui/SearchInput';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ClienteForm from './ClienteForm';
import { clientesApi } from '../../api/clientes';
import { usePagination } from '../../hooks/usePagination';
import styled from 'styled-components';

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
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

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const pagination = usePagination(1, 10);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientesApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      setClientes(data.data || data.clientes || []);
      pagination.setTotal(data.total || 0);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    pagination.resetPage();
  }, [pagination]);

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await clientesApi.remove(deleteId);
      toast.success('Cliente excluído com sucesso');
      setDeleteId(null);
      fetchClientes();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingCliente(null);
    fetchClientes();
  };

  const columns = [
    {
      field: 'nome',
      header: 'Nome',
      sortable: true,
      render: (row) => <span style={{ fontWeight: 500 }}>{row.nome}</span>,
    },
    {
      field: 'telefone',
      header: 'Telefone',
      render: (row) =>
        row.telefone ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPhone size={14} />
            {row.telefone}
          </span>
        ) : (
          '-'
        ),
    },
    {
      field: 'whatsapp',
      header: 'WhatsApp',
      render: (row) =>
        row.whatsapp ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiMessageCircle size={14} style={{ color: '#00C851' }} />
            {row.whatsapp}
          </span>
        ) : (
          '-'
        ),
    },
    {
      field: 'email',
      header: 'E-mail',
      render: (row) => row.email || '-',
    },
    {
      field: 'equipamentos',
      header: 'Equipamentos',
      render: (row) => (
        <Badge variant="primary">
          {row._count?.equipamentos || row.equipamentos?.length || 0}
        </Badge>
      ),
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
              handleEdit(row);
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
      <PageHeader title="Clientes" subtitle="Gerencie seus clientes">
        <Button icon={FiPlus} onClick={() => setModalOpen(true)}>
          Novo Cliente
        </Button>
      </PageHeader>

      <TopBar>
        <SearchInput
          placeholder="Buscar por nome, telefone ou e-mail..."
          onSearch={handleSearch}
        />
      </TopBar>

      <Table
        columns={columns}
        data={clientes}
        loading={loading}
        onRowClick={(row) => navigate(`/clientes/${row.id}`)}
        emptyMessage="Nenhum cliente encontrado"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={pagination.setPage}
      />

      {modalOpen && (
        <ClienteForm
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingCliente(null);
          }}
          onSuccess={handleFormSuccess}
          cliente={editingCliente}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Todos os equipamentos e ordens de serviço associados serão desvinculados."
      />
    </div>
  );
}
