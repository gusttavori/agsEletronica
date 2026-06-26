import styled, { css, keyframes } from 'styled-components';
import { FiLoader } from 'react-icons/fi';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.bgPrimary};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryHover};
      box-shadow: ${({ theme }) => theme.shadows.glow};
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }
  `,
  secondary: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
      background: ${({ theme }) => theme.colors.primaryLight};
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.white};

    &:hover:not(:disabled) {
      background: #cc3636;
      box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.textPrimary};
      background: ${({ theme }) => theme.colors.bgElevated};
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }
  `,
  success: css`
    background: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.white};

    &:hover:not(:disabled) {
      background: #00a844;
      box-shadow: 0 0 20px rgba(0, 200, 81, 0.3);
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }
  `,
};

const sizes = {
  sm: css`
    padding: 6px 12px;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    gap: 4px;
  `,
  md: css`
    padding: 10px 20px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    gap: 8px;
  `,
  lg: css`
    padding: 14px 28px;
    font-size: ${({ theme }) => theme.fontSizes.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    gap: 8px;
  `,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  font-family: ${({ theme }) => theme.fonts.primary};
  white-space: nowrap;
  line-height: 1;

  ${({ $variant }) => variants[$variant] || variants.primary}
  ${({ $size }) => sizes[$size] || sizes.md}

  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Spinner = styled(FiLoader)`
  animation: ${spin} 0.8s linear infinite;
`;

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  type = 'button',
  ...props
}) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <Spinner size={size === 'sm' ? 14 : 18} />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 18} />
      ) : null}
      {children}
    </StyledButton>
  );
}
