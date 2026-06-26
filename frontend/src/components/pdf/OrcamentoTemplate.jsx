import styled from 'styled-components';

const PrintContainer = styled.div`
  padding: 24px;
  background: #ffffff;
  color: #000000;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 12px; /* Reduzido levemente para garantir página única */
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;

  /* Margem ideal para segurar tudo em 1 página */
  @page {
    size: A4;
    margin: 15mm; 
  }

  @media print {
    padding: 0;
    margin: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 3px solid #FFD100;
  padding-bottom: 16px;
  margin-bottom: 20px; /* Reduzido para economizar espaço vertical */
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h1 {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin: 0;
    color: #0f172a;
  }
  
  span {
    color: #475569;
    font-size: 11px;
    font-weight: 500;
  }
`;

const DocumentTitle = styled.div`
  text-align: right;
  
  h2 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
  }
  
  .os-number {
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
    margin-top: 4px;
  }

  .date {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
  }
`;

const SectionBlock = styled.div`
  margin-bottom: 20px; /* Otimizado */
`;

const BlockTitle = styled.h3`
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  color: #0f172a;
  border-left: 4px solid #FFD100;
  padding-left: 8px;
`;

const GridInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const InfoGroup = styled.div`
  background: #f8fafc;
  padding: 12px; /* Mais compacto */
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InfoLine = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
  
  .label {
    font-weight: 700;
    color: #475569;
    min-width: 80px;
  }
  .value {
    color: #0f172a;
    font-weight: 500;
  }
`;

const TextContent = styled.div`
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  color: #1e293b;
  white-space: pre-wrap;
  font-size: 12px;
  min-height: 32px; /* Altura mínima reduzida para evitar quebras de página */
`;

const PrintTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;

  th {
    background: #1e293b;
    color: #FFD100;
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    padding: 10px 12px;
  }

  td {
    padding: 10px 12px; /* Respiro equilibrado */
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }
`;

const TotalContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  
  .box {
    background: #1e293b;
    color: #ffffff;
    padding: 10px 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 15px;
    font-weight: 800;
    border-bottom: 3px solid #FFD100;
  }

  .value {
    color: #FFD100;
    font-size: 18px;
  }
`;

const FooterSignatures = styled.div`
  margin-top: 48px; /* Reduzido de 80px para puxar as assinaturas para cima */
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  text-align: center;
  page-break-inside: avoid;

  .line {
    border-top: 1px solid #94a3b8;
    margin-top: 30px;
    padding-top: 8px;
    font-size: 11px;
    color: #475569;
    font-weight: 600;
  }
`;

export function OrcamentoTemplate({ ordem, itens = [] }) {
  if (!ordem) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalDoc = itens.length > 0
    ? itens.reduce((acc, item) => acc + (parseFloat(item.valorUnitario) * parseInt(item.quantidade, 10)), 0)
    : parseFloat(ordem.valorTotal || 0);

  return (
    <PrintContainer>
      {/* CABEÇALHO DA EMPRESA ATUALIZADO */}
      <Header>
        <CompanyInfo>
          <h1>AGS ELETRÔNICA</h1>
          <span>Soluções em Manutenção e Componentes Tecnológicos</span>
          <span>Rua do Triunfo, 177, Sala 201 - Centro, Vitória da Conquista/BA</span>
          <span>Contato: (77) 98806-4700</span>
        </CompanyInfo>
        <DocumentTitle>
          <h2>ORDEM DE SERVIÇO</h2>
          <div className="os-number">Nº {ordem.numeroOs}</div>
          <div className="date">Emissão: {formatDate(ordem.createdAt)}</div>
        </DocumentTitle>
      </Header>

      {/* DADOS ENVOLVIDOS */}
      <SectionBlock>
        <GridInfo>
          <InfoGroup>
            <div style={{ fontWeight: '800', marginBottom: '6px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>DADOS DO CLIENTE</div>
            <InfoLine>
              <div className="label">Cliente:</div>
              <div className="value">{ordem.cliente?.nome || 'N/A'}</div>
            </InfoLine>
            <InfoLine>
              <div className="label">Contato:</div>
              <div className="value">{ordem.cliente?.telefone || ordem.cliente?.whatsapp || 'N/A'}</div>
            </InfoLine>
          </InfoGroup>

          <InfoGroup>
            <div style={{ fontWeight: '800', marginBottom: '6px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>EQUIPAMENTO</div>
            <InfoLine>
              <div className="label">Aparelho:</div>
              <div className="value">{`${ordem.equipamento?.marca || ''} ${ordem.equipamento?.modelo || ''}`.trim() || 'N/A'}</div>
            </InfoLine>
            <InfoLine>
              <div className="label">Nº de Série:</div>
              <div className="value">{ordem.equipamento?.numeroSerie || 'N/A'}</div>
            </InfoLine>
          </InfoGroup>
        </GridInfo>
      </SectionBlock>

      {/* LAUDO TÉCNICO */}
      <SectionBlock>
        <BlockTitle>Histórico Técnico</BlockTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>DEFEITO RELATADO:</div>
            <TextContent>{ordem.defeitoInformado || 'Nenhum defeito catalogado.'}</TextContent>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>DIAGNÓSTICO DA ASSISTÊNCIA:</div>
            <TextContent>{ordem.diagnostico || 'Aparelho em fase de triagem/análise técnica.'}</TextContent>
          </div>
          {ordem.solucao && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>SOLUÇÃO APLICADA:</div>
              <TextContent>{ordem.solucao}</TextContent>
            </div>
          )}
        </div>
      </SectionBlock>

      {/* TABELA DE VALORES */}
      <SectionBlock>
        <BlockTitle>Detalhamento de Peças e Serviços</BlockTitle>
        <PrintTable>
          <thead>
            <tr>
              <th style={{ width: '15%', textAlign: 'left' }}>Natureza</th>
              <th style={{ width: '45%', textAlign: 'left' }}>Descrição detalhada</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Qtd</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Val. Unitário</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, index) => (
              <tr key={index}>
                <td>{item.tipo === 'PECA' ? 'Peça' : 'Mão de Obra'}</td>
                <td style={{ fontWeight: '600' }}>{item.descricao}</td>
                <td style={{ textAlign: 'center' }}>{item.quantidade}</td>
                <td style={{ textAlign: 'right' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorUnitario)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorUnitario * item.quantidade)}
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  Nenhum item de orçamento anexado a esta OS. Exibindo valor global configurado.
                </td>
              </tr>
            )}
          </tbody>
        </PrintTable>
      </SectionBlock>

      {/* VALOR FECHADO */}
      <TotalContainer>
        <div className="box">
          <span>TOTAL GERAL:</span>
          <span className="value">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDoc)}</span>
        </div>
      </TotalContainer>

      {/* ASSINATURAS REPOSICIONADAS */}
      <FooterSignatures>
        <div>
          <div className="line">AGS ELETRÔNICA<br />Responsável Técnico</div>
        </div>
        <div>
          <div className="line">GUSTAVO RICARDO MOREIRA SILVA<br />Assinatura do Cliente</div>
        </div>
      </FooterSignatures>
    </PrintContainer>
  );
}