import styled, { css } from 'styled-components';

const StyledCard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ $padding, theme }) => $padding || theme.spacing.lg};
  transition: all ${({ theme }) => theme.transitions.normal};
  animation: fadeIn 0.3s ease;

  ${({ $hoverable }) => $hoverable && css`
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.md};
      border-color: ${({ theme }) => theme.colors.borderLight};
    }
  `}

  ${({ $accent }) => $accent && css`
    border-top: 3px solid ${$accent};
  `}

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function Card({ children, padding, hoverable = false, accent, className, ...props }) {
  return (
    <StyledCard
      $padding={padding}
      $hoverable={hoverable}
      $accent={accent}
      className={className}
      {...props}
    >
      {children}
    </StyledCard>
  );
}
