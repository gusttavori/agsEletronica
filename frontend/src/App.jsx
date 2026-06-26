import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import theme from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme.colors.bgCard,
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.fontSizes.sm,
            fontFamily: theme.fonts.primary,
            boxShadow: theme.shadows.lg,
          },
          success: {
            iconTheme: {
              primary: theme.colors.success,
              secondary: theme.colors.bgCard,
            },
          },
          error: {
            iconTheme: {
              primary: theme.colors.danger,
              secondary: theme.colors.bgCard,
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
