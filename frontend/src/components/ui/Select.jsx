import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';

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

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px 36px 10px 14px;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  appearance: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryGlow};
  }

  &:hover:not(:focus) {
    border-color: ${({ theme }) => theme.colors.textMuted};
  }

  ${({ $hasError }) => $hasError && css`
    border-color: ${({ theme }) => theme.colors.danger};
  `}

  option {
    background: ${({ theme }) => theme.colors.bgCard};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChevronIcon = styled(FiChevronDown)`
  position: absolute;
  right: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
`;

const ErrorMessage = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
`;

const Select = forwardRef(({ label, error, children, placeholder, className, ...props }, ref) => {
  return (
    <Wrapper className={className}>
      {label && <Label>{label}</Label>}
      <SelectWrapper>
        <StyledSelect ref={ref} $hasError={!!error} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </StyledSelect>
        <ChevronIcon size={18} />
      </SelectWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Wrapper>
  );
});

Select.displayName = 'Select';

export default Select;
