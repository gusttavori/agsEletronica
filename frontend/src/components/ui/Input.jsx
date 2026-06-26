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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.span`
  position: absolute;
  left: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  pointer-events: none;
  transition: color ${({ theme }) => theme.transitions.fast};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  ${({ $hasIcon }) => $hasIcon && css`
    padding-left: 40px;
  `}

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
  animation: slideDown 0.2s ease;

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Input = forwardRef(({ label, error, icon: Icon, className, ...props }, ref) => {
  return (
    <Wrapper className={className}>
      {label && <Label>{label}</Label>}
      <InputWrapper>
        {Icon && (
          <IconWrapper>
            <Icon size={18} />
          </IconWrapper>
        )}
        <StyledInput
          ref={ref}
          $hasIcon={!!Icon}
          $hasError={!!error}
          {...props}
        />
      </InputWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Wrapper>
  );
});

Input.displayName = 'Input';

export default Input;
