import styled from 'styled-components';

export const FormContainer = styled.div`
  background: #ffffff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  
  /* Resetando interferências do tema global escuro */
  * {
    color: #111827;
  }
`;

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: ${props => props.$variant === 'outline' ? '1px solid #d1d5db' : 'none'};
  background: ${props => props.$variant === 'primary' ? '#FFD100' : props.$variant === 'outline' ? '#ffffff' : '#f3f4f6'};
  color: ${props => props.$variant === 'primary' ? '#000000' : '#374151'};

  &:hover:not(:disabled) {
    background: ${props => props.$variant === 'primary' ? '#e6bc00' : props.$variant === 'outline' ? '#f9fafb' : '#e5e7eb'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FormRow = styled.form`
  display: grid; 
  grid-template-columns: 2fr 1fr 100px 150px auto; 
  gap: 16px; 
  align-items: end; 
  background: #f8fafc;
  padding: 20px; 
  border-radius: 6px; 
  margin-bottom: 32px; 
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #475569;
`;

export const InputField = styled.input`
  height: 40px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background-color: #ffffff;
  color: #0f172a !important; /* Força o texto a ser escuro */
  
  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #FFD100;
    box-shadow: 0 0 0 2px rgba(255, 209, 0, 0.2);
  }
`;

export const SelectField = styled.select`
  height: 40px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background-color: #ffffff;
  color: #0f172a !important;
  
  &:focus {
    border-color: #FFD100;
    box-shadow: 0 0 0 2px rgba(255, 209, 0, 0.2);
  }
`;

export const TableHeader = styled.th`
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  text-align: ${props => props.$align || 'left'};
`;

export const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  text-align: ${props => props.$align || 'left'};
`;