import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled, { css } from 'styled-components';
import {
  FiGrid,
  FiUsers,
  FiMonitor,
  FiClipboard,
  FiColumns,
  FiDatabase,
  FiShield,
  FiChevronLeft,
  FiLogOut,
  FiZap,
  FiDollarSign,
  FiDownload,
  FiMenu, // <-- Ícone do Menu Mobile
  FiX     // <-- Ícone para fechar o Menu Mobile
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

// --- ESTILOS RESPONSIVOS ---
const SidebarWrapper = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: ${({ $collapsed }) => ($collapsed ? '68px' : '240px')};
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: all ${({ theme }) => theme.transitions.normal};
  overflow: hidden;

  /* No Mobile, o menu fica escondido na esquerda e surge ao clicar */
  @media (max-width: 768px) {
    width: 260px;
    transform: ${({ $mobileOpen }) => ($mobileOpen ? 'translateX(0)' : 'translateX(-100%)')};
    box-shadow: ${({ $mobileOpen }) => ($mobileOpen ? '4px 0 24px rgba(0,0,0,0.5)' : 'none')};
  }
`;

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  z-index: 99;
  opacity: ${({ $mobileOpen }) => ($mobileOpen ? 1 : 0)};
  pointer-events: ${({ $mobileOpen }) => ($mobileOpen ? 'auto' : 'none')};
  transition: opacity 0.3s ease;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bgPrimary};
  border: none;
  box-shadow: 0 4px 12px rgba(255, 209, 0, 0.4);
  z-index: 98;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  @media (max-width: 768px) {
    display: flex;
  }

  &:active {
    transform: scale(0.95);
  }
`;

// --- DEMAIS ESTILOS (MANTIDOS) ---
const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  min-height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bgPrimary};
  flex-shrink: 0;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  transition: opacity ${({ theme }) => theme.transitions.fast};

  @media (max-width: 768px) {
    opacity: 1; /* Sempre visível no mobile */
  }
`;

const LogoTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.5px;
`;

const LogoSubtitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Nav = styled.nav`
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.border}; border-radius: 4px; }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &.active {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const NavLabel = styled.span`
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  transition: opacity ${({ theme }) => theme.transitions.fast};

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const SectionLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 16px 12px 8px;
  white-space: nowrap;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  transition: opacity ${({ theme }) => theme.transitions.fast};

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const BottomSection = styled.div`
  padding: 12px 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const InstallButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bgPrimary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  border: none;
  cursor: pointer;
  overflow: hidden;

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bgPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  transition: opacity ${({ theme }) => theme.transitions.fast};

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

const UserName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CollapseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 12px;
  gap: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  border: none;
  background: transparent;
  cursor: pointer;

  svg {
    flex-shrink: 0;
    transition: transform ${({ theme }) => theme.transitions.normal};
    transform: ${({ $collapsed }) => ($collapsed ? 'rotate(180deg)' : 'rotate(0)')};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: 768px) {
    display: none; /* Esconde o botão de recolher no celular */
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  border: none;
  background: transparent;
  cursor: pointer;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(255, 68, 68, 0.1);
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const ALL_NAV_ITEMS = [
  { path: '/dashboard', icon: FiGrid, label: 'Dashboard', roles: ['ADMIN', 'TECNICO', 'ATENDENTE'] },
  { path: '/clientes', icon: FiUsers, label: 'Clientes', roles: ['ADMIN', 'ATENDENTE'] },
  { path: '/equipamentos', icon: FiMonitor, label: 'Equipamentos', roles: ['ADMIN', 'TECNICO'] },
  { path: '/ordens-servico', icon: FiClipboard, label: 'Ordens de Serviço', roles: ['ADMIN', 'TECNICO', 'ATENDENTE'] },
  { path: '/kanban', icon: FiColumns, label: 'Kanban', roles: ['ADMIN', 'TECNICO'] },
  { path: '/banco-defeitos', icon: FiDatabase, label: 'Banco de Defeitos', roles: ['ADMIN', 'TECNICO'] },
];

const ADMIN_ITEMS = [
  { path: '/financeiro', icon: FiDollarSign, label: 'Financeiro' },
  { path: '/auditoria', icon: FiShield, label: 'Auditoria' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // <-- Estado para o mobile
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  const location = useLocation();
  const { user, logout } = useAuth();

  const userRole = user?.role || user?.perfil || 'TECNICO';
  const isAdmin = userRole === 'ADMIN';

  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  // Fecha o menu mobile automaticamente ao trocar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Aplicativo instalado com sucesso');
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Botão Flutuante (Somente Mobile) */}
      <MobileMenuButton onClick={() => setMobileOpen(true)}>
        <FiMenu size={24} />
      </MobileMenuButton>

      {/* Overlay escurecido ao fundo (Somente Mobile) */}
      <MobileOverlay $mobileOpen={mobileOpen} onClick={() => setMobileOpen(false)} />

      <SidebarWrapper $collapsed={collapsed} $mobileOpen={mobileOpen}>
        <Logo>
          <LogoIcon>
            <FiZap size={20} />
          </LogoIcon>
          <LogoText $collapsed={collapsed}>
            <LogoTitle>AGS ELETRÔNICA</LogoTitle>
            <LogoSubtitle>Sistema de Gestão</LogoSubtitle>
          </LogoText>
        </Logo>

        <Nav>
          <SectionLabel $collapsed={collapsed}>Menu</SectionLabel>
          {visibleNavItems.map((item) => (
            <NavItem key={item.path} to={item.path}>
              <item.icon />
              <NavLabel $collapsed={collapsed}>{item.label}</NavLabel>
            </NavItem>
          ))}

          {isAdmin && (
            <>
              <SectionLabel $collapsed={collapsed}>Administração</SectionLabel>
              {ADMIN_ITEMS.map((item) => (
                <NavItem key={item.path} to={item.path}>
                  <item.icon />
                  <NavLabel $collapsed={collapsed}>{item.label}</NavLabel>
                </NavItem>
              ))}
            </>
          )}
        </Nav>

        <BottomSection>
          {isInstallable && (
            <InstallButton onClick={handleInstallClick} title="Instalar Aplicativo">
              <FiDownload />
              <NavLabel $collapsed={collapsed}>Instalar App</NavLabel>
            </InstallButton>
          )}

          <UserInfo>
            <UserAvatar>{getInitials(user?.nome)}</UserAvatar>
            <UserDetails $collapsed={collapsed}>
              <UserName>{user?.nome || 'Usuário'}</UserName>
              <UserRole>{user?.role || user?.perfil || 'Técnico'}</UserRole>
            </UserDetails>
          </UserInfo>

          <LogoutButton onClick={logout}>
            <FiLogOut size={20} />
            <NavLabel $collapsed={collapsed}>Sair</NavLabel>
          </LogoutButton>

          <CollapseButton $collapsed={collapsed} onClick={() => setCollapsed(!collapsed)}>
            <FiChevronLeft size={20} />
            <NavLabel $collapsed={collapsed}>Recolher</NavLabel>
          </CollapseButton>
        </BottomSection>
      </SidebarWrapper>
    </>
  );
}