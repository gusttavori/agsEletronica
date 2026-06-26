import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Importação da API real
import financeiroApi from '../../api/financeiro';

// --- ESTILOS RESPONSIVOS ---
const KPIGrid = styled.div`
  display: grid;
  /* Minmax de 250px mantido para que no celular eles caiam um embaixo do outro */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const KPICard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const KPIInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 600;
    text-transform: uppercase;
  }

  strong {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const FiltersWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textPrimary}; /* Branco */
`;

// Wrapper para evitar que a tabela quebre o layout no celular
const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.borderLight}; border-radius: 4px; }
`;

export default function FinanceiroDashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await financeiroApi.getRelatorio();
      const dados = response?.data?.data || response?.data || response || [];

      const calculo = dados.reduce((acc, item) => {
        const valorLiquido = Number(item.valor) || 0;
        
        if (item.tipo === 'MAO_DE_OBRA') {
          acc.entradas += valorLiquido;
        } else if (item.tipo === 'PECA') {
          acc.saidas += valorLiquido;
        }
        return acc;
      }, { entradas: 0, saidas: 0 });

      calculo.saldo = calculo.entradas - calculo.saidas;

      setTransacoes(dados);
      setResumo(calculo);

    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const columns = [
    {
      field: 'data',
      header: 'Data',
      width: '120px',
      render: (row) => new Date(row.data).toLocaleDateString('pt-BR'),
    },
    { 
      field: 'descricao', 
      header: 'Descrição / Serviço' 
    },
    {
      field: 'osRelacionada',
      header: 'Nº OS',
      width: '150px',
      // Cor alterada de '#475569' (Azul acinzentado escuro) para branco/cinza claro
      render: (row) => <span style={{ fontWeight: '600', color: '#f8fafc' }}>{row.osRelacionada || '-'}</span>
    },
    {
      field: 'tipo',
      header: 'Natureza',
      width: '150px',
      render: (row) => (
        <Badge variant={row.tipo === 'MAO_DE_OBRA' ? 'success' : 'danger'}>
          {row.tipo === 'MAO_DE_OBRA' ? 'Mão de Obra (Entrada)' : 'Peça (Custo)'}
        </Badge>
      ),
    },
    { 
      field: 'valor', 
      header: 'Valor', 
      width: '150px',
      render: (row) => (
        <span style={{ 
          fontWeight: '700', 
          color: row.tipo === 'MAO_DE_OBRA' ? '#10b981' : '#ef4444' 
        }}>
          {row.tipo === 'MAO_DE_OBRA' ? '+' : '-'}{formatCurrency(Number(row.valor) || 0)}
        </span>
      )
    },
  ];

  if (loading) return <LoadingSpinner center size="lg" />;

  return (
    <div className="page-enter">
      <PageHeader
        title="Controle Financeiro"
        subtitle="Gestão de receitas (Mão de Obra) e custos (Peças)"
      />

      <KPIGrid>
        <KPICard>
          <IconWrapper $bg="rgba(16, 185, 129, 0.15)" $color="#10b981">
            <FiTrendingUp size={28} />
          </IconWrapper>
          <KPIInfo>
            <span>Total Entradas (Mão de Obra)</span>
            <strong>{formatCurrency(resumo.entradas)}</strong>
          </KPIInfo>
        </KPICard>

        <KPICard>
          <IconWrapper $bg="rgba(239, 68, 68, 0.15)" $color="#ef4444">
            <FiTrendingDown size={28} />
          </IconWrapper>
          <KPIInfo>
            <span>Total Custos (Peças)</span>
            <strong>{formatCurrency(resumo.saidas)}</strong>
          </KPIInfo>
        </KPICard>

        <KPICard style={{ borderLeft: resumo.saldo >= 0 ? '4px solid #10b981' : '4px solid #ef4444' }}>
          <IconWrapper $bg="rgba(255, 209, 0, 0.15)" $color="#FFD100">
            <FiDollarSign size={28} />
          </IconWrapper>
          <KPIInfo>
            <span>Saldo Líquido Operacional</span>
            <strong style={{ color: resumo.saldo >= 0 ? '#10b981' : '#ef4444' }}>
              {formatCurrency(resumo.saldo)}
            </strong>
          </KPIInfo>
        </KPICard>
      </KPIGrid>

      <Card>
        <FiltersWrapper>
          <SectionTitle>Extrato de Movimentações</SectionTitle>
          <Button variant="outline" size="sm">
            <FiFilter /> Filtrar por Mês
          </Button>
        </FiltersWrapper>

        <TableWrapper>
          {/* Força a tabela a ter pelo menos 700px, ativando o scroll horizontal no mobile */}
          <div style={{ minWidth: '700px' }}>
            <Table
              columns={columns}
              data={transacoes}
              emptyMessage="Nenhuma movimentação financeira encontrada."
            />
          </div>
        </TableWrapper>
      </Card>
    </div>
  );
}