import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import toast from 'react-hot-toast';

import bancoDefeitosApi from '../../api/bancoDefeitos';

import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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

const CATEGORIAS = [
  'TELEVISAO', 'SOM', 'AMPLIFICADOR', 'CODIFICADOR', 'RECEPTOR', 'DVD_BLURAY', 'OUTRO'
];

const schema = yup.object().shape({
  marca: yup.string().required('Marca é obrigatória'),
  modelo: yup.string().required('Modelo é obrigatório'),
  categoria: yup.string().required('Categoria é obrigatória'),
  sintoma: yup.string().required('Sintoma é obrigatório'),
  diagnostico: yup.string().required('Diagnóstico é obrigatório'),
  solucao: yup.string().required('Solução é obrigatória'),
  pecasUtilizadas: yup.string(),
  observacoes: yup.string(),
  ordemServicoId: yup.string().nullable(),
});

export default function DefeitoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const autoFillData = location.state?.osData || null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      marca: autoFillData?.marca || '',
      modelo: autoFillData?.modelo || '',
      categoria: autoFillData?.categoria || 'TELEVISAO',
      sintoma: autoFillData?.sintoma || '',
      diagnostico: autoFillData?.diagnostico || '',
      solucao: autoFillData?.solucao || '',
      pecasUtilizadas: autoFillData?.pecasUtilizadas || '',
      observacoes: '',
      ordemServicoId: autoFillData?.ordemServicoId || null,
    },
  });

  useEffect(() => {
    if (isEditing) {
      const fetchDefeito = async () => {
        try {
          const data = await bancoDefeitosApi.getById(id);
          reset({
            marca: data.marca,
            modelo: data.modelo,
            categoria: data.categoria,
            sintoma: data.sintoma,
            diagnostico: data.diagnostico,
            solucao: data.solucao,
            pecasUtilizadas: data.pecasUtilizadas || '',
            observacoes: data.observacoes || '',
            ordemServicoId: data.ordemServicoId || null,
          });
        } catch (error) {
          toast.error('Erro ao carregar registro');
          navigate('/banco-defeitos');
        } finally {
          setLoading(false);
        }
      };
      fetchDefeito();
    }
  }, [id, isEditing, reset, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data };
      
      // Tratamento para não enviar ID vazio como string para o Prisma
      if (payload.ordemServicoId && payload.ordemServicoId !== '') {
        payload.ordemServicoId = parseInt(payload.ordemServicoId, 10);
      } else {
        payload.ordemServicoId = null;
      }

      if (isEditing) {
        await bancoDefeitosApi.update(id, payload);
        toast.success('Registro atualizado com sucesso');
      } else {
        await bancoDefeitosApi.create(payload);
        toast.success('Defeito catalogado com sucesso');
      }
      navigate('/banco-defeitos');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar defeito');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner center size="lg" />;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? `Editar Registro` : 'Catalogar Novo Defeito'}
        subtitle={isEditing ? 'Atualize as informações do banco' : 'Adicione um novo problema conhecido à base de conhecimento'}
      />

      <Card>
        {autoFillData && (
          <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255, 209, 0, 0.1)', borderLeft: '4px solid #FFD100', borderRadius: '4px', color: '#0f172a' }}>
            <strong>Modo Automático:</strong> Os dados desta página foram pré-preenchidos usando a <strong>OS #{autoFillData.numeroOs}</strong>. Revise as informações antes de salvar no Banco de Conhecimento.
          </div>
        )}

        <FormGrid onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="marca"
            control={control}
            render={({ field }) => (
              <Input
                label="Marca"
                placeholder="Ex: Samsung, LG..."
                {...field}
                error={errors.marca?.message}
              />
            )}
          />

          <Controller
            name="modelo"
            control={control}
            render={({ field }) => (
              <Input
                label="Modelo"
                placeholder="Ex: UN50TU8000"
                {...field}
                error={errors.modelo?.message}
              />
            )}
          />

          <Controller
            name="categoria"
            control={control}
            render={({ field }) => (
              <Select label="Categoria do Equipamento" {...field} error={errors.categoria?.message}>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            )}
          />

          <FullWidth>
            <Controller
              name="sintoma"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Sintoma Apresentado"
                  placeholder="Como o aparelho se comportava? O que o cliente relatou?"
                  rows={2}
                  {...field}
                  error={errors.sintoma?.message}
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
                  placeholder="Qual era exatamente a raiz do problema?"
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
                  label="Solução / Procedimento"
                  placeholder="Passo a passo do que foi feito para resolver..."
                  rows={4}
                  {...field}
                  error={errors.solucao?.message}
                />
              )}
            />
          </FullWidth>

          <FullWidth>
            <Controller
              name="pecasUtilizadas"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Peças Utilizadas"
                  placeholder="Quais componentes foram trocados? (Opcional)"
                  rows={2}
                  {...field}
                  error={errors.pecasUtilizadas?.message}
                />
              )}
            />
          </FullWidth>

          <FullWidth>
            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Observações Extras"
                  placeholder="Dicas, avisos ou macetes sobre este reparo... (Opcional)"
                  rows={2}
                  {...field}
                  error={errors.observacoes?.message}
                />
              )}
            />
          </FullWidth>

          <FullWidth>
            <Actions>
              <Button type="button" variant="outline" onClick={() => navigate('/banco-defeitos')}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={submitting}>
                {isEditing ? 'Atualizar Registro' : 'Salvar no Banco'}
              </Button>
            </Actions>
          </FullWidth>
        </FormGrid>
      </Card>
    </div>
  );
}