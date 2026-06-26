import styled, { css } from 'styled-components';
import {
  FiInbox,
  FiSearch,
  FiClock,
  FiTool,
  FiCheckCircle,
  FiPackage,
} from 'react-icons/fi';

const STATUS_CONFIG = {
  RECEBIDO: {
    label: 'Recebido',
    color: '#33B5E5',
    bg: 'rgba(51, 181, 229, 0.15)',
    icon: FiInbox,
  },
  EM_DIAGNOSTICO: {
    label: 'Em Diagnóstico',
    color: '#FFB300',
    bg: 'rgba(255, 179, 0, 0.15)',
    icon: FiSearch,
  },
  AGUARDANDO_APROVACAO: {
    label: 'Aguardando Aprovação',
    color: '#FF8800',
    bg: 'rgba(255, 136, 0, 0.15)',
    icon: FiClock,
  },
  EM_REPARO: {
    label: 'Em Reparo',
    color: '#AA66CC',
    bg: 'rgba(170, 102, 204, 0.15)',
    icon: FiTool,
  },
  PRONTO: {
    label: 'Pronto',
    color: '#00C851',
    bg: 'rgba(0, 200, 81, 0.15)',
    icon: FiCheckCircle,
  },
  ENTREGUE: {
    label: 'Entregue',
    color: '#A0A0A0',
    bg: 'rgba(160, 160, 160, 0.15)',
    icon: FiPackage,
  },
};

const StyledStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  white-space: nowrap;
  line-height: 1;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  transition: all ${({ theme }) => theme.transitions.fast};

  svg {
    flex-shrink: 0;
  }

  ${({ $clickable }) => $clickable && css`
    cursor: pointer;
    
    &:hover {
      filter: brightness(1.2);
      transform: scale(1.05);
    }
  `}
`;

export default function StatusBadge({ status, clickable = false, onClick, className }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.RECEBIDO;
  const Icon = config.icon;

  return (
    <StyledStatusBadge
      $color={config.color}
      $bg={config.bg}
      $clickable={clickable}
      onClick={onClick}
      className={className}
    >
      <Icon size={12} />
      {config.label}
    </StyledStatusBadge>
  );
}

export { STATUS_CONFIG };
