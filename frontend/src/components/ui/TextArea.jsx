import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryGlow};
  }

  &:hover:not(:focus) {
    border-color: ${({ theme }) => theme.colors.textMuted};
  }

  ${({ $hasError }) => $hasError && css`
    border-color: ${({ theme }) => theme.colors.danger};
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.15);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
`;

const TextArea = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <Wrapper className={className}>
      {label && <Label>{label}</Label>}
      <StyledTextArea
        ref={ref}
        $hasError={!!error}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Wrapper>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
