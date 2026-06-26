import styled from 'styled-components';

const TabsWrapper = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 24px;
  overflow-x: auto;
`;

const Tab = styled.button`
  position: relative;
  padding: 12px 20px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  background: transparent;
  white-space: nowrap;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.textPrimary};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primary : 'transparent'};
    border-radius: 2px 2px 0 0;
    transition: background ${({ theme }) => theme.transitions.fast};
  }
`;

const TabCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primaryLight : theme.colors.bgElevated};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textMuted};
  margin-left: 8px;
`;

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <TabsWrapper>
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          $active={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <TabCount $active={activeTab === tab.key}>{tab.count}</TabCount>
          )}
        </Tab>
      ))}
    </TabsWrapper>
  );
}
