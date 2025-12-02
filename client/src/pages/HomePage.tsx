import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Grid as MuiGrid,
  GridProps as MuiGridProps,
  styled
} from '@mui/material';

// Create a custom Grid component with proper TypeScript types
interface GridProps extends MuiGridProps {
  item?: boolean;
  container?: boolean;
}

const Grid = styled(({ item, container, ...rest }: GridProps) => (
  <MuiGrid item={item} container={container} {...rest} />
))<GridProps>``;
import { Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { RootState } from '../app/store';


const HomePage: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Elevate Your Culinary Journey
              </Typography>
              <Typography variant="h5" paragraph>
                Discover, create, and share amazing recipes with Chef's Arsenal. 
                The ultimate tool for professional chefs and home cooks alike.
              </Typography>
              <Box sx={{ mt: 4 }}>
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      component={Link}
                      to="/register"
                      sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      component={Link}
                      to="/login"
                    >
                      Login
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    component={Link}
                    to="/recipes/new"
                  >
                    Create Recipe
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/hero-image.jpg"
                alt="Culinary ingredients"
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Why Choose Chef's Arsenal?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {[
            {
              title: 'Recipe Management',
              description: 'Easily create, edit, and organize your recipes with our intuitive interface.',
              icon: '🍳',
            },
            {
              title: 'Menu Planning',
              description: 'Plan your meals and create shopping lists with just a few clicks.',
              icon: '📋',
            },
            {
              title: 'Culinary Techniques',
              description: 'Learn and master cooking techniques with our comprehensive library.',
              icon: '👨‍🍳',
            },
            {
              title: 'Nutritional Info',
              description: 'Track nutritional information for all your recipes automatically.',
              icon: '📊',
            },
            {
              title: 'Share & Collaborate',
              description: 'Share your recipes with the community or keep them private.',
              icon: '🤝',
            },
            {
              title: 'Mobile Friendly',
              description: 'Access your recipes and plans from any device, anywhere.',
              icon: '📱',
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <Typography variant="h2" sx={{ mb: 2 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h5" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          py: 6,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" paragraph>
            Join thousands of chefs and food enthusiasts who are already using Chef's Arsenal 
            to transform their cooking experience.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            to={isAuthenticated ? '/recipes/new' : '/register'}
            sx={{ mt: 2 }}
          >
            {isAuthenticated ? 'Create Your First Recipe' : 'Sign Up Now'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
