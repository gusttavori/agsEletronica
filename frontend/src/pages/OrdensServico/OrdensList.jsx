import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEye, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

import ordensServicoApi from '../../api/ordensServico';
import clientesApi from '../../api/clientes';

import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import SearchInput from '../../components/ui/SearchInput';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';

const FiltersWrapper = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
`;

const ActionsWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const PRIORIDADES = {
  BAIXA: { label: 'Baixa', color: 'info' },
  NORMAL: { label: 'Normal', color: 'success' },
  ALTA: { label: 'Alta', color: 'warning' },
  URGENTE: { label: 'Urgente', color: 'danger' },
};

export default function OrdensList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clientes, setClientes] = useState([]);

  const debouncedSearch = useDebounce(search, 500);
  const pagination = usePagination({ totalItems: total });

  const loadClientes = async () => {
    try {
      const result = await clientesApi.getAll({ limit: 100 });
      setClientes(result.data || []);
    } catch (error) {
      toast.error('Erro ao carregar lista de clientes');
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ordensServicoApi.getAll({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: debouncedSearch,
        status,
        prioridade,
        clienteId,
      });
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (error) {
      toast.error('Erro ao carregar Ordens de Serviço');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, debouncedSearch, status, prioridade, clienteId]);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    { field: 'numeroOs', header: 'OS', width: '120px' },
    {
      field: 'cliente',
      header: 'Cliente',
      render: (row) => row.cliente?.nome || 'N/A',
    },
    {
      field: 'equipamento',
      header: 'Equipamento',
      render: (row) => `${row.equipamento?.marca} ${row.equipamento?.modelo}`,
    },
    {
      field: 'prioridade',
      header: 'Prioridade',
      width: '120px',
      render: (row) => {
        const p = PRIORIDADES[row.prioridade] || PRIORIDADES.NORMAL;
        return <Badge variant={p.color}>{p.label}</Badge>;
      },
    },
    {
      field: 'status',
      header: 'Status',
      width: '160px',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      field: 'actions',
      header: 'Ações',
      width: '120px',
      render: (row) => (
        <ActionsWrapper>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/ordens-servico/${row.id}`);
            }}
            title="Visualizar"
          >
            <FiEye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/ordens-servico/${row.id}/editar`);
            }}
            title="Editar"
          >
            <FiEdit2 size={16} />
          </Button>
        </ActionsWrapper>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        subtitle="Gerenciamento e acompanhamento de reparos"
      >
        <Button onClick={() => navigate('/ordens-servico/nova')}>
          <FiPlus /> Nova OS
        </Button>
      </PageHeader>

      <Card>
        <FiltersWrapper>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por OS ou cliente..."
            style={{ width: '300px' }}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Todos os Status</option>
            <option value="RECEBIDO">Recebido</option>
            <option value="EM_DIAGNOSTICO">Em Diagnóstico</option>
            <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
            <option value="EM_REPARO">Em Reparo</option>
            <option value="PRONTO">Pronto</option>
            <option value="ENTREGUE">Entregue</option>
          </Select>
          <Select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">Todas as Prioridades</option>
            <option value="BAIXA">Baixa</option>
            <option value="NORMAL">Normal</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </Select>
          <Select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            style={{ width: '220px' }}
          >
            <option value="">Todos os Clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </FiltersWrapper>

        <Table
          columns={columns}
          data={data}
          loading={loading}
          onRowClick={(row) => navigate(`/ordens-servico/${row.id}`)}
          emptyMessage="Nenhuma Ordem de Serviço encontrada"
        />

        {!loading && total > 0 && (
          <div style={{ marginTop: 24 }}>
            <Pagination {...pagination} />
          </div>
        )}
      </Card>
    </div>
  );
}
