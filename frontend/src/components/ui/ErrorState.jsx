import styled from 'styled-components';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from './Button';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: rgba(255, 68, 68, 0.1);
  color: ${({ theme }) => theme.colors.danger};
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
  max-width: 400px;
  margin-bottom: 20px;
`;

export default function ErrorState({
  message = 'Ocorreu um erro ao carregar os dados.',
  onRetry,
}) {
  return (
    <Wrapper>
      <IconWrapper>
        <FiAlertTriangle size={28} />
      </IconWrapper>
      <Title>Erro</Title>
      <Description>{message}</Description>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </Wrapper>
  );
}
