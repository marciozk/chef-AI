import React, { useState } from 'react';
import { useGetFavoriteRecipesQuery, useRemoveFromFavoritesMutation } from '../../features/favorites/favoritesApiSlice';
import { useAppSelector } from '../../app/hooks';
import { 
  Container, Box, Typography, Card, CardContent, CardMedia, CardActionArea,
  Chip, CircularProgress, Snackbar, Alert, useMediaQuery, IconButton, Tooltip,
  TextField, InputAdornment, Pagination, Divider, Button, Badge
} from '@mui/material';
import { Grid } from '@mui/material/Unstable_Grid2';
import { 
  Favorite as FavoriteIcon, Search as SearchIcon, Clear as ClearIcon,
  Timer as TimerIcon, Restaurant as RestaurantIcon, Star as StarIcon
} from '@mui/icons-material';

const FavoritesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isMobile = useMediaQuery('(max-width:600px)');
  
  const { data: favoritesData, isLoading, isError, refetch } = useGetFavoriteRecipesQuery({
    page,
    search: searchTerm,
    limit: 12
  });
  
  const [removeFromFavorites] = useRemoveFromFavoritesMutation();
  const favorites = favoritesData?.data || [];
  const totalPages = favoritesData?.totalPages || 1;

  const handleRemoveFavorite = async (recipeId: string) => {
    try {
      await removeFromFavorites(recipeId).unwrap();
      setSnackbar({
        open: true,
        message: 'Removed from favorites',
        severity: 'success'
      });
      refetch();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to remove from favorites',
        severity: 'error'
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(1);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error">Error loading favorites. Please try again.</Typography>
        <Button variant="outlined" onClick={() => refetch()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            My Favorites
            {favorites.length > 0 && (
              <Badge 
                badgeContent={favoritesData?.totalItems || 0} 
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search favorites..."
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 3, maxWidth: 500 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            endAdornment: searchTerm && (
              <IconButton size="small" onClick={clearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />
        
        {favorites.length === 0 ? (
          <Box textAlign="center" py={8}>
            <FavoriteIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No favorites yet
            </Typography>
            <Typography color="text.secondary" paragraph>
              {searchTerm 
                ? 'No matching favorites found. Try a different search.'
                : 'Save your favorite recipes to find them here later.'}
            </Typography>
            {!searchTerm && (
              <Button 
                variant="contained" 
                color="primary"
                href="/recipes"
              >
                Browse Recipes
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {favorites.map((recipe: any) => (
                <Grid xs={12} sm={6} md={4} lg={3} key={recipe._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea href={`/recipes/${recipe._id}`}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={recipe.image || '/images/recipe-placeholder.jpg'}
                        alt={recipe.title}
                      />
                    </CardActionArea>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {recipe.title}
                        </Typography>
                        <Tooltip title="Remove from favorites">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(recipe._id);
                            }}
                          >
                            <FavoriteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <StarIcon color="warning" fontSize="small" />
                        <Typography variant="body2" color="text.secondary" ml={0.5}>
                          {recipe.rating?.toFixed(1) || 'N/A'}
                          <Typography component="span" variant="body2" color="text.secondary">
                            {recipe.reviews ? ` (${recipe.reviews})` : ''}
                          </Typography>
                        </Typography>
                      </Box>
                      
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1.5}>
                        <Chip 
                          icon={<TimerIcon fontSize="small" />} 
                          label={`${recipe.prepTime + recipe.cookTime} min`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          icon={<RestaurantIcon fontSize="small" />} 
                          label={`${recipe.servings} ${recipe.servings === 1 ? 'serving' : 'servings'}`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FavoritesPage;
