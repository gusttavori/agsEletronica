import styled from 'styled-components';
import { FiInbox } from 'react-icons/fi';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 320px;
`;

export default function EmptyState({
  icon: Icon = FiInbox,
  title = 'Nenhum registro encontrado',
  description = 'Não há dados para exibir no momento.',
  action,
}) {
  return (
    <Wrapper>
      <IconWrapper>
        <Icon size={28} />
      </IconWrapper>
      <Title>{title}</Title>
      <Description>{description}</Description>
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </Wrapper>
  );
}
