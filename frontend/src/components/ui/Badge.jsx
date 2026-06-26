import styled, { css } from 'styled-components';

const badgeVariants = {
  default: css`
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textSecondary};
  `,
  primary: css`
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  `,
  success: css`
    background: rgba(0, 200, 81, 0.15);
    color: ${({ theme }) => theme.colors.success};
  `,
  warning: css`
    background: rgba(255, 179, 0, 0.15);
    color: ${({ theme }) => theme.colors.warning};
  `,
  danger: css`
    background: rgba(255, 68, 68, 0.15);
    color: ${({ theme }) => theme.colors.danger};
  `,
  info: css`
    background: rgba(51, 181, 229, 0.15);
    color: ${({ theme }) => theme.colors.info};
  `,
  purple: css`
    background: rgba(170, 102, 204, 0.15);
    color: #AA66CC;
  `,
  orange: css`
    background: rgba(255, 136, 0, 0.15);
    color: #FF8800;
  `,
  gray: css`
    background: rgba(160, 160, 160, 0.15);
    color: ${({ theme }) => theme.colors.textSecondary};
  `,
};

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  white-space: nowrap;
  line-height: 1;

  ${({ $variant }) => badgeVariants[$variant] || badgeVariants.default}
`;

export default function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <StyledBadge $variant={variant} className={className} {...props}>
      {children}
    </StyledBadge>
  );
}
