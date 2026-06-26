import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px 0;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ $active, theme }) => ($active ? theme.colors.bgPrimary : theme.colors.textSecondary)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primaryHover : theme.colors.bgElevated};
    color: ${({ $active, theme }) =>
      $active ? theme.colors.bgPrimary : theme.colors.textPrimary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 8px;
`;

const Ellipsis = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 4px;
`;

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (currentPage > 3) {
    pages.push('...');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('...');
  }

  pages.push(totalPages);

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  showInfo = true,
  total,
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <PaginationWrapper>
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <FiChevronLeft size={18} />
      </PageButton>

      {pages.map((p, i) =>
        p === '...' ? (
          <Ellipsis key={`ellipsis-${i}`}>...</Ellipsis>
        ) : (
          <PageButton
            key={p}
            $active={p === page}
            onClick={() => onPageChange(p)}
          >
            {p}
          </PageButton>
        )
      )}

      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <FiChevronRight size={18} />
      </PageButton>

      {showInfo && total !== undefined && (
        <PageInfo>
          {total} registro{total !== 1 ? 's' : ''}
        </PageInfo>
      )}
    </PaginationWrapper>
  );
}
