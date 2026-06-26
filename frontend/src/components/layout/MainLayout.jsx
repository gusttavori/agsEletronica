import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
`;

const MainContent = styled.main`
  flex: 1;
  /* Margem padrão para o desktop */
  margin-left: ${({ $sidebarWidth }) => $sidebarWidth};
  padding-top: 64px;
  transition: margin-left ${({ theme }) => theme.transitions.normal};
  min-height: 100vh;
  
  /* Garante que o conteúdo não vaze da tela */
  width: 100%;
  max-width: 100%;

  /* A MÁGICA DO MOBILE: Zera a margem quando a tela for menor que 768px */
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;

  /* Reduz os espaçamentos laterais no celular para ganhar área útil */
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export default function MainLayout() {
  // Como o Sidebar atualizado já gerencia o próprio estado (recolhido/mobile),
  // o Layout só precisa repassar a largura base padrão para o Desktop.
  const sidebarWidth = '240px';

  return (
    <LayoutWrapper>
      <Sidebar />
      <Header sidebarWidth={sidebarWidth} />
      <MainContent $sidebarWidth={sidebarWidth}>
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutWrapper>
  );
}