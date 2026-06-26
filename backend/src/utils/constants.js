const STATUS_LABELS = {
  RECEBIDO: 'Recebido',
  EM_DIAGNOSTICO: 'Em Diagnóstico',
  AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
  EM_REPARO: 'Em Reparo',
  PRONTO: 'Pronto',
  ENTREGUE: 'Entregue',
};

const CATEGORIA_LABELS = {
  TELEVISAO: 'Televisão',
  SOM: 'Som',
  AMPLIFICADOR: 'Amplificador',
  CODIFICADOR: 'Codificador',
  RECEPTOR: 'Receptor',
  DVD_BLURAY: 'DVD / Blu-ray',
  OUTRO: 'Outro',
};

const PRIORIDADE_LABELS = {
  BAIXA: 'Baixa',
  NORMAL: 'Normal',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

const ROLE_LABELS = {
  ADMIN: 'Administrador',
  TECNICO: 'Técnico',
  ATENDENTE: 'Atendente',
};

const TIPO_ITEM_LABELS = {
  PECA: 'Peça',
  MAO_DE_OBRA: 'Mão de Obra',
};

const ACAO_AUDITORIA_LABELS = {
  CRIACAO: 'Criação',
  EDICAO: 'Edição',
  EXCLUSAO: 'Exclusão',
  MUDANCA_STATUS: 'Mudança de Status',
};

const STATUS_FLOW = {
  RECEBIDO: ['EM_DIAGNOSTICO'],
  EM_DIAGNOSTICO: ['AGUARDANDO_APROVACAO', 'EM_REPARO'],
  AGUARDANDO_APROVACAO: ['EM_REPARO', 'ENTREGUE'],
  EM_REPARO: ['PRONTO'],
  PRONTO: ['ENTREGUE'],
  ENTREGUE: [],
};

module.exports = {
  STATUS_LABELS,
  CATEGORIA_LABELS,
  PRIORIDADE_LABELS,
  ROLE_LABELS,
  TIPO_ITEM_LABELS,
  ACAO_AUDITORIA_LABELS,
  STATUS_FLOW,
};
