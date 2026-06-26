import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce';

const Wrapper = styled.div`
  position: relative;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : '320px')};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
  transition: color ${({ theme }) => theme.transitions.fast};
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.bgElevated};
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 36px 10px 40px;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryGlow};
  }

  &:focus + ${SearchIcon} {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function SearchInput({
  placeholder = 'Buscar...',
  onSearch,
  delay = 300,
  fullWidth = false,
  className,
  value: controlledValue,
}) {
  const [value, setValue] = useState(controlledValue || '');
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    onSearch && onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch && onSearch('');
  };

  return (
    <Wrapper $fullWidth={fullWidth} className={className}>
      <InputWrapper>
        <StyledInput
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <SearchIcon size={18} />
        {value && (
          <ClearButton onClick={handleClear}>
            <FiX size={16} />
          </ClearButton>
        )}
      </InputWrapper>
    </Wrapper>
  );
}
