import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { setCredentials } from './features/auth/authSlice';
import { useGetMeQuery } from './features/auth/authApiSlice';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RecipeListPage from './pages/recipes/RecipeListPage';
import RecipeDetailPage from './pages/recipes/RecipeDetailPage';
import RecipeFormPage from './pages/recipes/RecipeFormPage';
import ProfilePage from './pages/profile/ProfilePage';
import MyRecipesPage from './pages/recipes/MyRecipesPage';
import FavoritesPage from './pages/favorites/FavoritesPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1A5276', // Deep Ocean
    },
    secondary: {
      main: '#E74C3C', // Spice Red
    },
    error: {
      main: '#C0392B', // Chili Red
    },
    warning: {
      main: '#F39C12', // Citrus Yellow
    },
    info: {
      main: '#3498DB', // Sky Blue
    },
    success: {
      main: '#27AE60', // Basil Green
    },
    background: {
      default: '#F8F9FA', // Cloud White
    },
  },
  typography: {
    fontFamily: '"Lato", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// Component to handle authentication state
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading } = useGetMeQuery();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user && !currentUser) {
      dispatch(setCredentials({ user, token: localStorage.getItem('token') || '' }));
    }
  }, [user, currentUser, dispatch]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return <>{children}</>;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthWrapper>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="recipes" element={<RecipeListPage />} />
                <Route path="recipes/:id" element={<RecipeDetailPage />} />
                
                {/* Protected routes */}
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-recipes"
                  element={
                    <ProtectedRoute>
                      <MyRecipesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="recipes/new"
                  element={
                    <ProtectedRoute>
                      <RecipeFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="recipes/:id/edit"
                  element={
                    <ProtectedRoute>
                      <RecipeFormPage editMode />
                    </ProtectedRoute>
                  }
                />
                
                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AuthWrapper>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
