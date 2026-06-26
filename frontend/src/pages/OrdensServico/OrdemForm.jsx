import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import ordensServicoApi from '../../api/ordensServico';
import clientesApi from '../../api/clientes';
import equipamentosApi from '../../api/equipamentos';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidth = styled.div`
  grid-column: 1 / -1;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 24px;
`;

const schema = yup.object().shape({
  clienteId: yup.mixed().required('Cliente é obrigatório'),
  equipamentoId: yup.mixed().required('Equipamento é obrigatório'),
  prioridade: yup.string().required('Prioridade é obrigatória'),
  status: yup.string().required('Status é obrigatório'),
  defeitoInformado: yup.string().required('Defeito informado é obrigatório'),
  diagnostico: yup.string().nullable(),
  solucao: yup.string().nullable(),
});

export default function OrdemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  
  const [clientes, setClientes] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(false);

  const [isInitializingEdit, setIsInitializingEdit] = useState(isEditing);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      clienteId: '',
      equipamentoId: '',
      prioridade: 'NORMAL',
      status: 'RECEBIDO',
      defeitoInformado: '',
      diagnostico: '',
      solucao: '',
    },
  });

  const selectedClienteId = watch('clienteId');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const result = await clientesApi.getAll({ limit: 500 });
        setClientes(result?.data?.data || result?.data || []);
      } catch (error) {
        toast.error('Erro ao carregar clientes');
      }
    };
    fetchClientes();
  }, []);

  useEffect(() => {
    if (!selectedClienteId) {
      setEquipamentos([]);
      return;
    }
    
    if (isEditing && isInitializingEdit) return;

    const fetchEquipamentos = async () => {
      setLoadingEquipamentos(true);
      try {
        const result = await equipamentosApi.getAll({ clienteId: selectedClienteId, limit: 100 });
        setEquipamentos(result?.data?.data || result?.data || []);
      } catch (error) {
        toast.error('Erro ao carregar equipamentos do cliente');
      } finally {
        setLoadingEquipamentos(false);
      }
    };
    fetchEquipamentos();
  }, [selectedClienteId, isEditing, isInitializingEdit]);

  useEffect(() => {
    if (isEditing) {
      const fetchOrdem = async () => {
        try {
          const response = await ordensServicoApi.getById(id);
          const data = response?.data || response;

          const safeClienteId = data.clienteId || data.cliente_id || data.cliente?.id || '';
          const safeEquipamentoId = data.equipamentoId || data.equipamento_id || data.equipamento?.id || '';

          if (safeClienteId) {
            const eqResult = await equipamentosApi.getAll({ clienteId: safeClienteId, limit: 100 });
            setEquipamentos(eqResult?.data?.data || eqResult?.data || []);
          }

          reset({
            clienteId: safeClienteId ? safeClienteId.toString() : '',
            equipamentoId: safeEquipamentoId ? safeEquipamentoId.toString() : '',
            prioridade: data.prioridade || 'NORMAL',
            status: data.status || 'RECEBIDO',
            defeitoInformado: data.defeitoInformado || data.defeito_informado || '',
            diagnostico: data.diagnostico || '',
            solucao: data.solucao || '',
          });
        } catch (error) {
          toast.error('Erro ao carregar Ordem de Serviço');
          navigate('/ordens-servico');
        } finally {
          setIsInitializingEdit(false);
          setLoading(false);
        }
      };
      fetchOrdem();
    }
  }, [id, isEditing, reset, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        clienteId: parseInt(data.clienteId, 10),
        equipamentoId: parseInt(data.equipamentoId, 10),
        prioridade: data.prioridade,
        status: data.status,
        defeitoInformado: data.defeitoInformado,
        diagnostico: data.diagnostico || '',
        solucao: data.solucao || '',
      };

      if (isEditing) {
        // Envia TODOS os dados, incluindo Cliente, Equipamento e Status
        await ordensServicoApi.update(id, payload);
        toast.success('OS atualizada com sucesso');
      } else {
        await ordensServicoApi.create(payload);
        toast.success('OS criada com sucesso');
      }
      navigate('/ordens-servico');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar OS');
      console.error('Erro detalhado:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const onError = (errors) => {
    console.error("Erros de validação do formulário que estão bloqueando o envio:", errors);
    toast.error("Preencha todos os campos obrigatórios.");
  };

  if (loading) {
    return <LoadingSpinner center size="lg" />;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? `Editar Ordem de Serviço` : 'Nova Ordem de Serviço'}
        subtitle={isEditing ? 'Atualize os dados da OS' : 'Preencha os dados iniciais do equipamento'}
      />

      <Card>
        <FormGrid onSubmit={handleSubmit(onSubmit, onError)}>
          <Controller
            name="clienteId"
            control={control}
            render={({ field }) => (
              <Select
                label="Cliente"
                {...field}
                error={errors.clienteId?.message}
              >
                <option value="">Selecione o Cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id.toString()}>{c.nome}</option>
                ))}
              </Select>
            )}
          />

          <Controller
            name="equipamentoId"
            control={control}
            render={({ field }) => (
              <Select
                label="Equipamento"
                {...field}
                error={errors.equipamentoId?.message}
                disabled={!selectedClienteId || loadingEquipamentos}
              >
                <option value="">
                  {loadingEquipamentos ? 'Carregando...' : 'Selecione o Equipamento'}
                </option>
                {equipamentos.map((e) => (
                  <option key={e.id} value={e.id.toString()}>{e.marca} {e.modelo} (SN: {e.numeroSerie || 'S/N'})</option>
                ))}
              </Select>
            )}
          />

          <Controller
            name="prioridade"
            control={control}
            render={({ field }) => (
              <Select label="Prioridade" {...field} error={errors.prioridade?.message}>
                <option value="BAIXA">Baixa</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </Select>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select label="Status Atual" {...field} error={errors.status?.message}>
                <option value="RECEBIDO">Recebido</option>
                <option value="EM_DIAGNOSTICO">Em Diagnóstico</option>
                <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
                <option value="EM_REPARO">Em Reparo</option>
                <option value="PRONTO">Pronto</option>
                <option value="ENTREGUE">Entregue</option>
              </Select>
            )}
          />

          <FullWidth>
            <Controller
              name="defeitoInformado"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Defeito Informado pelo Cliente"
                  placeholder="Descreva detalhadamente o problema relatado..."
                  rows={4}
                  {...field}
                  error={errors.defeitoInformado?.message}
                />
              )}
            />
          </FullWidth>

          <FullWidth>
            <Controller
              name="diagnostico"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Diagnóstico Técnico"
                  placeholder="Observações do técnico após análise..."
                  rows={4}
                  {...field}
                  error={errors.diagnostico?.message}
                />
              )}
            />
          </FullWidth>

          <FullWidth>
            <Controller
              name="solucao"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Solução Aplicada"
                  placeholder="Detalhes do reparo executado..."
                  rows={4}
                  {...field}
                  error={errors.solucao?.message}
                />
              )}
            />
          </FullWidth>

          <FullWidth>
            <Actions>
              <Button type="button" variant="outline" onClick={() => navigate('/ordens-servico')}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={submitting}>
                {isEditing ? 'Atualizar OS' : 'Criar OS'}
              </Button>
            </Actions>
          </FullWidth>
        </FormGrid>
      </Card>
    </div>
  );
}