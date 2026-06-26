import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiSearch, FiChevronRight, FiUser, FiMonitor, FiClipboard, FiX, FiLogOut } from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce';
import globalSearchApi from '../../api/globalSearch';
import { useAuth } from '../../contexts/AuthContext';

const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  right: 0;
  left: ${({ $sidebarWidth }) => $sidebarWidth};
  height: 64px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 90;
  transition: left ${({ theme }) => theme.transitions.normal};

  /* RESPONSIVIDADE: Zera o espaçamento esquerdo no celular e reduz o padding */
  @media (max-width: 768px) {
    left: 0;
    padding: 0 16px;
  }
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  /* RESPONSIVIDADE: Esconde o caminho de navegação no celular para dar espaço à busca */
  @media (max-width: 768px) {
    display: none;
  }
`;

const BreadcrumbItem = styled.span`
  color: ${({ $active, theme }) =>
    $active ? theme.colors.textPrimary : theme.colors.textSecondary};
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.medium : theme.fontWeights.normal};
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 360px;

  /* RESPONSIVIDADE: Barra de busca adaptável */
  @media (max-width: 768px) {
    width: 100%;
    max-width: 220px;
    margin-right: auto;
  }

  @media (max-width: 480px) {
    max-width: 180px;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
`;

const SearchInputStyled = styled.input`
  width: 100%;
  padding: 8px 14px 8px 38px;
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
`;

const SearchResults = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-height: 400px;
  overflow-y: auto;
  z-index: 200;
  animation: slideDown 0.2s ease;

  /* RESPONSIVIDADE: Garante que o menu de resultados não vaze no celular */
  @media (max-width: 768px) {
    width: 280px;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ResultGroup = styled.div`
  padding: 8px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const ResultGroupTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 8px 8px;
`;

const ResultItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  text-align: left;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
  }
`;

const ResultIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ResultTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultSubtitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const NoResults = styled.div`
  padding: 24px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
  
  @media (max-width: 480px) {
    padding: 6px;
    border-radius: 50%;
  }
`;

// Container novo para o nome de usuário (permite esconder no mobile)
const ProfileName = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

const HeaderLogout = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: transparent;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(255, 68, 68, 0.1);
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const ROUTE_NAMES = {
  '/dashboard': 'Dashboard',
  '/clientes': 'Clientes',
  '/equipamentos': 'Equipamentos',
  '/ordens-servico': 'Ordens de Serviço',
  '/kanban': 'Kanban',
  '/banco-defeitos': 'Banco de Defeitos',
  '/auditoria': 'Auditoria',
};

export default function Header({ sidebarWidth = '240px' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const navigate = useNavigate();
  const location = useLocation();
  const wrapperRef = useRef(null);
  const { user, logout } = useAuth();

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    let path = '';
    for (const part of parts) {
      path += `/${part}`;
      const name = ROUTE_NAMES[path] || decodeURIComponent(part);
      breadcrumbs.push({ path, name });
    }

    return breadcrumbs;
  };

  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults(null);
      setShowResults(false);
      return;
    }

    try {
      const data = await globalSearchApi.search(query);
      setResults(data);
      setShowResults(true);
    } catch {
      setResults(null);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleResultClick = (type, id) => {
    setShowResults(false);
    setSearchQuery('');
    if (type === 'clientes') navigate(`/clientes/${id}`);
    else if (type === 'equipamentos') navigate(`/equipamentos/${id}`);
    else if (type === 'ordensServico') navigate(`/ordens-servico/${id}`);
    else if (type === 'bancoDefeitos') navigate(`/banco-defeitos/${id}`);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'clientes': return FiUser;
      case 'equipamentos': return FiMonitor;
      case 'ordensServico': return FiClipboard;
      case 'bancoDefeitos': return FiSearch; 
      default: return FiSearch;
    }
  };

  const getGroupLabel = (type) => {
    switch (type) {
      case 'clientes': return 'Clientes';
      case 'equipamentos': return 'Equipamentos';
      case 'ordensServico': return 'Ordens de Serviço';
      case 'bancoDefeitos': return 'Banco de Defeitos';
      default: return type;
    }
  };

  const breadcrumbs = getBreadcrumbs();
  const hasResults = results && Object.values(results).some(
    (group) => Array.isArray(group) && group.length > 0
  );

  return (
    <HeaderWrapper $sidebarWidth={sidebarWidth}>
      <Breadcrumb>
        <BreadcrumbItem>AGS</BreadcrumbItem>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiChevronRight size={14} />
            <BreadcrumbItem $active={i === breadcrumbs.length - 1}>
              {crumb.name}
            </BreadcrumbItem>
          </span>
        ))}
      </Breadcrumb>

      <SearchWrapper ref={wrapperRef}>
        <SearchInputWrapper>
          <SearchInputStyled
            type="text"
            placeholder="Buscar clientes, equipamentos, OS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => results && setShowResults(true)}
          />
          <SearchIcon size={18} />
        </SearchInputWrapper>

        {showResults && (
          <SearchResults>
            {hasResults ? (
              Object.entries(results).map(([type, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                const Icon = getIcon(type);
                return (
                  <ResultGroup key={type}>
                    <ResultGroupTitle>{getGroupLabel(type)}</ResultGroupTitle>
                    {items.slice(0, 5).map((item) => (
                      <ResultItem
                        key={item.id}
                        onClick={() => handleResultClick(type, item.id)}
                      >
                        <ResultIcon>
                          <Icon size={16} />
                        </ResultIcon>
                        <ResultInfo>
                          <ResultTitle>
                            {item.nome || item.numero_os || `${item.marca} ${item.modelo}`}
                          </ResultTitle>
                          <ResultSubtitle>
                            {item.telefone || item.categoria || item.status || ''}
                          </ResultSubtitle>
                        </ResultInfo>
                      </ResultItem>
                    ))}
                  </ResultGroup>
                );
              })
            ) : (
              <NoResults>Nenhum resultado encontrado</NoResults>
            )}
          </SearchResults>
        )}
      </SearchWrapper>

      <HeaderActions>
        <ProfileButton>
          <FiUser size={16} />
          <ProfileName>{user?.nome ? user.nome.split(' ')[0] : 'Usuário'}</ProfileName>
        </ProfileButton>
        <HeaderLogout onClick={logout} title="Sair do sistema">
          <FiLogOut size={18} />
        </HeaderLogout>
      </HeaderActions>
    </HeaderWrapper>
  );
}