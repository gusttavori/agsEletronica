import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import Button from '../../components/ui/Button';
import { equipamentosApi } from '../../api/equipamentos';
import { clientesApi } from '../../api/clientes';
import { useDebounce } from '../../hooks/useDebounce';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ClienteSearch = styled.div`
  position: relative;
`;

const ClienteList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const ClienteOption = styled.button`
  display: block;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bgCard};
  }

  span {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const SelectedCliente = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: 1px solid ${({ theme }) => theme.colors.primary}33;
  border-radius: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 6px;
`;

const CATEGORIAS = [
  { value: 'TELEVISAO', label: 'Televisão' },
  { value: 'SOM', label: 'Som' },
  { value: 'AMPLIFICADOR', label: 'Amplificador' },
  { value: 'CODIFICADOR', label: 'Codificador' },
  { value: 'RECEPTOR', label: 'Receptor' },
  { value: 'DVD_BLURAY', label: 'DVD / Blu-Ray' },
  { value: 'OUTRO', label: 'Outro' }
];

const schema = yup.object({
  clienteId: yup.string().required('Selecione um cliente'),
  categoria: yup.string().required('Categoria é obrigatória'),
  marca: yup.string().required('Marca é obrigatória'),
  modelo: yup.string().required('Modelo é obrigatório'),
  numero_serie: yup.string().nullable(),
  observacoes: yup.string().nullable(),
});

export default function EquipamentoForm({ isOpen, onClose, onSuccess, equipamento }) {
  const isEditing = !!equipamento;
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showClienteList, setShowClienteList] = useState(false);
  const debouncedSearch = useDebounce(clienteSearch, 300);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      clienteId: '',
      categoria: '',
      marca: '',
      modelo: '',
      numero_serie: '',
      observacoes: '',
    },
  });

  useEffect(() => {
    if (equipamento) {
      reset({
        clienteId: equipamento.clienteId || '',
        categoria: equipamento.categoria || '',
        marca: equipamento.marca || '',
        modelo: equipamento.modelo || '',
        numero_serie: equipamento.numero_serie || '',
        observacoes: equipamento.observacoes || '',
      });
      if (equipamento.cliente) {
        setSelectedCliente(equipamento.cliente);
      }
    } else {
      reset({
        clienteId: '',
        categoria: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        observacoes: '',
      });
      setSelectedCliente(null);
    }
  }, [equipamento, reset]);

  const searchClientes = useCallback(async () => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setClientes([]);
      return;
    }
    try {
      const data = await clientesApi.getAll({ search: debouncedSearch, limit: 10 });
      setClientes(data.data || data.clientes || []);
      setShowClienteList(true);
    } catch {
      setClientes([]);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    searchClientes();
  }, [searchClientes]);

  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    setValue('clienteId', String(cliente.id));
    setShowClienteList(false);
    setClienteSearch('');
  };

  const onSubmit = async (data) => {
    try {
      // Mapeamento correto para o Prisma (de numero_serie para numeroSerie)
      const payload = {
        clienteId: Number(data.clienteId),
        categoria: data.categoria,
        marca: data.marca,
        modelo: data.modelo,
        numeroSerie: data.numero_serie, 
        observacoes: data.observacoes
      };

      if (isEditing) {
        await equipamentosApi.update(equipamento.id, payload);
        toast.success('Equipamento atualizado com sucesso');
      } else {
        await equipamentosApi.create(payload);
        toast.success('Equipamento criado com sucesso');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar equipamento');
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button type="submit" form="equipamento-form" isLoading={isSubmitting}>
        {isEditing ? 'Atualizar' : 'Criar Equipamento'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Equipamento' : 'Novo Equipamento'}
      footer={footer}
      maxWidth="580px"
    >
      <Form id="equipamento-form" onSubmit={handleSubmit(onSubmit)}>
        <ClienteSearch>
          <Input
            label="Cliente *"
            placeholder="Buscar cliente por nome..."
            value={clienteSearch}
            onChange={(e) => setClienteSearch(e.target.value)}
            onFocus={() => clientes.length > 0 && setShowClienteList(true)}
            error={errors.clienteId?.message}
          />
          {showClienteList && clientes.length > 0 && (
            <ClienteList>
              {clientes.map((c) => (
                <ClienteOption key={c.id} type="button" onClick={() => handleSelectCliente(c)}>
                  {c.nome}
                  <span>{c.telefone || c.email || ''}</span>
                </ClienteOption>
              ))}
            </ClienteList>
          )}
          {selectedCliente && (
            <SelectedCliente>
              {selectedCliente.nome}
              <button
                type="button"
                style={{ color: 'inherit', fontSize: 12 }}
                onClick={() => {
                  setSelectedCliente(null);
                  setValue('clienteId', '');
                }}
              >
                ✕
              </button>
            </SelectedCliente>
          )}
          <input type="hidden" {...register('clienteId')} />
        </ClienteSearch>

        <Select
          label="Categoria *"
          placeholder="Selecione a categoria"
          error={errors.categoria?.message}
          {...register('categoria')}
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </Select>

        <Row>
          <Input
            label="Marca *"
            placeholder="Ex: Samsung, LG, Dell"
            error={errors.marca?.message}
            {...register('marca')}
          />
          <Input
            label="Modelo *"
            placeholder="Ex: UN55TU7000"
            error={errors.modelo?.message}
            {...register('modelo')}
          />
        </Row>

        <Input
          label="Número de Série"
          placeholder="S/N do equipamento"
          error={errors.numero_serie?.message}
          {...register('numero_serie')}
        />

        <TextArea
          label="Observações"
          placeholder="Observações sobre o equipamento..."
          error={errors.observacoes?.message}
          {...register('observacoes')}
        />
      </Form>
    </Modal>
  );
}