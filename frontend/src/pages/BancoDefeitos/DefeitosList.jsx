import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

import bancoDefeitosApi from '../../api/bancoDefeitos';

import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
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

const CATEGORIAS = [
  'TELEVISAO', 'SOM', 'AMPLIFICADOR', 'CODIFICADOR', 'RECEPTOR', 'DVD_BLURAY', 'OUTRO'
];

export default function DefeitosList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');

  const debouncedSearch = useDebounce(search, 500);
  const pagination = usePagination({ totalItems: total });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await bancoDefeitosApi.getAll({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: debouncedSearch,
        categoria,
      });
      
      // EXTRAÇÃO ROBUSTA (Igual fizemos no Dashboard e Kanban)
      const responseData = result?.data || result;
      const items = responseData?.data || responseData || [];
      
      // Garante que o estado seja um array, mesmo se a API falhar
      setData(Array.isArray(items) ? items : []);
      
      // Pega o total do backend, ou usa o tamanho do array como fallback
      setTotal(responseData?.total || items.length || 0);
      
    } catch (error) {
      toast.error('Erro ao carregar Banco de Defeitos');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, debouncedSearch, categoria]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este registro do banco de defeitos?')) {
      try {
        await bancoDefeitosApi.remove(id);
        toast.success('Registro excluído com sucesso');
        loadData();
      } catch (error) {
        toast.error('Erro ao excluir registro');
      }
    }
  };

  const columns = [
    { field: 'marca', header: 'Marca', width: '120px' },
    { field: 'modelo', header: 'Modelo', width: '150px' },
    {
      field: 'categoria',
      header: 'Categoria',
      width: '150px',
      render: (row) => <Badge variant="primary">{row.categoria}</Badge>,
    },
    { field: 'sintoma', header: 'Sintoma' },
    {
      field: 'diagnostico',
      header: 'Diagnóstico',
      render: (row) => row.diagnostico?.length > 40 ? `${row.diagnostico.substring(0, 40)}...` : row.diagnostico,
    },
    {
      field: 'createdAt',
      header: 'Data de Cadastro',
      width: '140px',
      render: (row) => new Date(row.createdAt).toLocaleDateString('pt-BR'),
    },
    {
      field: 'actions',
      header: 'Ações',
      width: '140px',
      render: (row) => (
        <ActionsWrapper>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/banco-defeitos/${row.id}`);
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
              navigate(`/banco-defeitos/${row.id}/editar`);
            }}
            title="Editar"
          >
            <FiEdit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleDelete(e, row.id)}
            title="Excluir"
            style={{ color: '#ff4444' }}
          >
            <FiTrash2 size={16} />
          </Button>
        </ActionsWrapper>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Banco de Defeitos"
        subtitle="Base de conhecimento técnico e soluções conhecidas"
      >
        <Button onClick={() => navigate('/banco-defeitos/novo')}>
          <FiPlus /> Novo Defeito
        </Button>
      </PageHeader>

      <Card>
        <FiltersWrapper>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo ou sintoma..."
            style={{ width: '300px' }}
          />
          <Select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Todas as Categorias</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </FiltersWrapper>

        <Table
          columns={columns}
          data={data}
          loading={loading}
          onRowClick={(row) => navigate(`/banco-defeitos/${row.id}`)}
          emptyMessage="Nenhum defeito registrado no banco"
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