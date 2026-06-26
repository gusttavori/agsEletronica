import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorState from '../components/ui/ErrorState';
import styled from 'styled-components';

const FallbackWrapper = styled.div`
  padding: 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function RoleGuard({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role || user.perfil;

  if (!allowedRoles.includes(userRole)) {
    return (
      <FallbackWrapper>
        <ErrorState 
          title="Acesso Negado" 
          message="Você não tem permissão para acessar esta página." 
        />
      </FallbackWrapper>
    );
  }

  return children;
}
