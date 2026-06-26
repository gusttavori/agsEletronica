import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FiPlus, FiSave, FiDownload, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { OrcamentoTemplate } from '../../components/pdf/OrcamentoTemplate';

// Importando a API correta
import orcamentoApi from '../../api/orcamento';

import {
  FormContainer,
  Button,
  FormRow,
  InputGroup,
  Label,
  InputField,
  SelectField,
  TableHeader,
  TableCell
} from './OrcamentoForm.styles';

export default function OrcamentoForm({ ordemServico, itensIniciais = [], onSuccess }) {
  // Inicializando com os itens que já estão no banco
  const [itens, setItens] = useState(itensIniciais);
  
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('PECA');
  const [quantidade, setQuantidade] = useState(1);
  const [valor, setValor] = useState('');

  // 1. Criando a referência com o nome correto
  const orcamentoPdfRef = useRef(null);

  // 2. Configuração V3 blindada
  const reactToPrintFn = useReactToPrint({ 
    contentRef: orcamentoPdfRef,
    documentTitle: `Orcamento_${ordemServico?.numeroOs || 'AGS'}`,
    onAfterPrint: () => toast.success('Orçamento exportado com sucesso!'),
  });

  const adicionarItem = (e) => {
    e.preventDefault();
    if (!descricao || !valor) {
      toast.error('Preencha a descrição e o valor do item.');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico)) {
      toast.error('Formato de valor inválido.');
      return;
    }

    const novoItem = {
      descricao,
      tipo,
      quantidade: Number(quantidade),
      valorUnitario: valorNumerico,
    };

    setItens([...itens, novoItem]);
    setDescricao('');
    setValor('');
    setQuantidade(1);
  };

  const removerItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const salvarNoBanco = async () => {
    try {
      // Faz o POST dos itens para o backend Node.js
      await orcamentoApi.save(ordemServico.id, itens);
      
      toast.success('Orçamento salvo no banco de dados!');
      
      if (onSuccess) {
        onSuccess(itens);
      }
    } catch (error) {
      toast.error('Erro ao salvar orçamento.');
      console.error(error);
    }
  };

  return (
    <FormContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Editar Orçamento</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          
          {/* Botão de Exportar usando a função V3 */}
          <Button 
            variant="outline" 
            onClick={() => reactToPrintFn()}
          >
            <FiDownload style={{ marginRight: '8px' }} /> Exportar PDF
          </Button>

          <Button $variant="primary" onClick={salvarNoBanco}>
            <FiSave /> Salvar Orçamento
          </Button>
        </div>
      </div>

      <FormRow onSubmit={adicionarItem}>
        <InputGroup>
          <Label>Descrição do Serviço / Peça</Label>
          <InputField 
            value={descricao} 
            onChange={(e) => setDescricao(e.target.value)} 
            placeholder="Ex: Placa T-Con..."
          />
        </InputGroup>

        <InputGroup>
          <Label>Natureza</Label>
          <SelectField value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="PECA">Peça / Componente</option>
            <option value="MAO_DE_OBRA">Mão de Obra</option>
          </SelectField>
        </InputGroup>

        <InputGroup>
          <Label>Qtd</Label>
          <InputField 
            type="number" 
            min="1" 
            value={quantidade} 
            onChange={(e) => setQuantidade(e.target.value)} 
          />
        </InputGroup>

        <InputGroup>
          <Label>Valor Unit. (R$)</Label>
          <InputField 
            type="text" 
            value={valor} 
            onChange={(e) => setValor(e.target.value)} 
            placeholder="0.00"
          />
        </InputGroup>

        <Button type="submit" style={{ height: '40px', background: '#e2e8f0', color: '#0f172a' }}>
          <FiPlus /> Add
        </Button>
      </FormRow>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <TableHeader>Descrição</TableHeader>
              <TableHeader>Natureza</TableHeader>
              <TableHeader $align="center">Qtd</TableHeader>
              <TableHeader $align="right">Valor</TableHeader>
              <TableHeader $align="right">Ação</TableHeader>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, idx) => (
              <tr key={idx}>
                <TableCell style={{ fontWeight: '500' }}>{item.descricao}</TableCell>
                <TableCell>{item.tipo === 'PECA' ? 'Peça' : 'Serviço'}</TableCell>
                <TableCell $align="center">{item.quantidade}</TableCell>
                <TableCell $align="right">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorUnitario)}
                </TableCell>
                <TableCell $align="right">
                  <button type="button" onClick={() => removerItem(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <FiTrash2 size={18} />
                  </button>
                </TableCell>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <TableCell colSpan="5" $align="center" style={{ padding: '48px', color: '#94a3b8' }}>
                  Nenhum item adicionado ao orçamento. Preencha os campos acima.
                </TableCell>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TEMPLATE OCULTO PARA IMPRESSÃO (SEM ESPREMER O PDF) */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <div ref={orcamentoPdfRef}>
          <OrcamentoTemplate ordem={ordemServico} itens={itens} />
        </div>
      </div>
      
    </FormContainer>
  );
}