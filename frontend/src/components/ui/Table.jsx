import styled, { keyframes } from 'styled-components';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bgCard};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: ${({ theme }) => theme.colors.bgSecondary};
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  cursor: ${({ $sortable }) => ($sortable ? 'pointer' : 'default')};
  user-select: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ $sortable, theme }) => ($sortable ? theme.colors.textPrimary : theme.colors.textSecondary)};
  }
`;

const ThContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SortIcon = styled.span`
  display: flex;
  flex-direction: column;
  font-size: 10px;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
  }

  ${({ $clickable }) => $clickable && `
    cursor: pointer;
  `}
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
`;

const SkeletonRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const SkeletonCell = styled.td`
  padding: 12px 16px;
`;

const SkeletonBar = styled.div`
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.bgElevated} 25%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.bgElevated} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  width: ${({ $width }) => $width || '80%'};
`;

const EmptyRow = styled.tr``;

const EmptyCell = styled.td`
  padding: 48px 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
  sortField,
  sortDirection,
  onSort,
  skeletonRows = 5,
}) {
  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;
    const newDirection = sortField === column.field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.field, newDirection);
  };

  return (
    <TableWrapper>
      <StyledTable>
        <Thead>
          <tr>
            {columns.map((col) => (
              <Th
                key={col.field || col.key}
                $sortable={col.sortable}
                onClick={() => handleSort(col)}
                style={{ width: col.width }}
              >
                <ThContent>
                  {col.header}
                  {col.sortable && (
                    <SortIcon $active={sortField === col.field}>
                      <FiChevronUp
                        size={10}
                        style={{
                          opacity: sortField === col.field && sortDirection === 'asc' ? 1 : 0.3,
                        }}
                      />
                      <FiChevronDown
                        size={10}
                        style={{
                          marginTop: -4,
                          opacity: sortField === col.field && sortDirection === 'desc' ? 1 : 0.3,
                        }}
                      />
                    </SortIcon>
                  )}
                </ThContent>
              </Th>
            ))}
          </tr>
        </Thead>
        <Tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow key={i}>
                {columns.map((col, j) => (
                  <SkeletonCell key={j}>
                    <SkeletonBar $width={`${50 + Math.random() * 40}%`} />
                  </SkeletonCell>
                ))}
              </SkeletonRow>
            ))
          ) : data && data.length > 0 ? (
            data.map((row, i) => (
              <Tr
                key={row.id || i}
                $clickable={!!onRowClick}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <Td key={col.field || col.key} style={{ width: col.width }}>
                    {col.render ? col.render(row) : row[col.field]}
                  </Td>
                ))}
              </Tr>
            ))
          ) : (
            <EmptyRow>
              <EmptyCell colSpan={columns.length}>{emptyMessage}</EmptyCell>
            </EmptyRow>
          )}
        </Tbody>
      </StyledTable>
    </TableWrapper>
  );
}
