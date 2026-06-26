import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Button from '../../components/ui/Button';
import { clientesApi } from '../../api/clientes';

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

const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório').min(2, 'Mínimo de 2 caracteres'),
  telefone: yup.string().nullable(),
  whatsapp: yup.string().nullable(),
  email: yup.string().email('E-mail inválido').nullable(),
  endereco: yup.string().nullable(),
  observacoes: yup.string().nullable(),
});

export default function ClienteForm({ isOpen, onClose, onSuccess, cliente }) {
  const isEditing = !!cliente;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nome: '',
      telefone: '',
      whatsapp: '',
      email: '',
      endereco: '',
      observacoes: '',
    },
  });

  useEffect(() => {
    if (cliente) {
      reset({
        nome: cliente.nome || '',
        telefone: cliente.telefone || '',
        whatsapp: cliente.whatsapp || '',
        email: cliente.email || '',
        endereco: cliente.endereco || '',
        observacoes: cliente.observacoes || '',
      });
    } else {
      reset({
        nome: '',
        telefone: '',
        whatsapp: '',
        email: '',
        endereco: '',
        observacoes: '',
      });
    }
  }, [cliente, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await clientesApi.update(cliente.id, data);
        toast.success('Cliente atualizado com sucesso');
      } else {
        await clientesApi.create(data);
        toast.success('Cliente criado com sucesso');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar cliente');
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button
        type="submit"
        form="cliente-form"
        isLoading={isSubmitting}
      >
        {isEditing ? 'Atualizar' : 'Criar Cliente'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
      footer={footer}
      maxWidth="580px"
    >
      <Form id="cliente-form" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Nome *"
          placeholder="Nome completo do cliente"
          error={errors.nome?.message}
          {...register('nome')}
        />

        <Row>
          <Input
            label="Telefone"
            placeholder="(00) 0000-0000"
            error={errors.telefone?.message}
            {...register('telefone')}
          />
          <Input
            label="WhatsApp"
            placeholder="(00) 00000-0000"
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />
        </Row>

        <Input
          label="E-mail"
          type="email"
          placeholder="email@exemplo.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Endereço"
          placeholder="Rua, número, bairro, cidade"
          error={errors.endereco?.message}
          {...register('endereco')}
        />

        <TextArea
          label="Observações"
          placeholder="Observações sobre o cliente..."
          error={errors.observacoes?.message}
          {...register('observacoes')}
        />
      </Form>
    </Modal>
  );
}
