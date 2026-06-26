import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiActivity, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Importando a API correta de auditoria
import auditoriaApi from '../../api/auditoria';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const FiltersWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const getActionColor = (action) => {
  switch (action?.toUpperCase()) {
    case 'CREATE': return 'success';
    case 'UPDATE': return 'warning';
    case 'DELETE': return 'danger';
    case 'LOGIN': return 'info';
    default: return 'primary';
  }
};

const getActionLabel = (action) => {
  switch (action?.toUpperCase()) {
    case 'CREATE': return 'Criação';
    case 'UPDATE': return 'Atualização';
    case 'DELETE': return 'Exclusão';
    case 'LOGIN': return 'Acesso';
    default: return action || 'Ação';
  }
};

export default function AuditoriaList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAuditoria = useCallback(async () => {
    try {
      setLoading(true);
      const response = await auditoriaApi.getAll();
      
      // Extração robusta para garantir compatibilidade com o formato de resposta da API
      const responseData = response?.data || response;
      const dataItems = responseData?.data || responseData || [];
      
      setLogs(Array.isArray(dataItems) ? dataItems : []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar logs de auditoria.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditoria();
  }, [loadAuditoria]);

  const columns = [
    {
      field: 'createdAt',
      header: 'Data e Hora',
      width: '180px',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString('pt-BR') : '-',
    },
    { 
      field: 'usuario', 
      header: 'Usuário', 
      width: '150px',
      render: (row) => (
        <span style={{ fontWeight: '600' }}>
          {row.usuario?.nome || row.usuario || 'Sistema'}
        </span>
      )
    },
    {
      field: 'acao',
      header: 'Ação',
      width: '120px',
      render: (row) => (
        <Badge variant={getActionColor(row.acao)}>
          {getActionLabel(row.acao)}
        </Badge>
      ),
    },
    { 
      field: 'modulo', 
      header: 'Módulo', 
      width: '180px' 
    },
    { 
      field: 'detalhes', 
      header: 'Detalhes da Atividade' 
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        title="Auditoria de Sistema"
        subtitle="Rastreamento de atividades, alterações e acessos dos usuários"
      />

      <Card>
        <FiltersWrapper>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiActivity color="#475569" /> Logs Recentes
            </h3>
          </div>
          <Button variant="outline" size="sm">
            <FiFilter /> Filtrar Logs
          </Button>
        </FiltersWrapper>

        <Table
          columns={columns}
          data={logs}
          loading={loading}
          emptyMessage="Nenhum registro de auditoria encontrado no período."
        />
      </Card>
    </div>
  );
}