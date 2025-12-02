import { Box, Container, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
      }}
    >
      <CssBaseline />
      <Header />
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 4,
        }}
      >
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
}
