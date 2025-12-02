import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useGetRecipesQuery } from '../../features/recipes/recipeApiSlice';
import { useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Chip, 
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Skeleton,
  Pagination,
  Stack
} from '@mui/material';
import { Search, Add, Timer, Restaurant, LocalDining, FilterList } from '@mui/icons-material';

const RecipeListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    cuisine: '',
    diet: '',
    time: ''
  });
  
  const { data: recipes, isLoading, isError } = useGetRecipesQuery({
    page,
    search: searchTerm,
    ...filters
  });
  
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (filter: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
    setPage(1);
  };

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">Error loading recipes. Please try again later.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Discover Recipes
        </Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/recipes/new')}
          >
            Add Recipe
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            label="Cuisine"
            value={filters.cuisine}
            onChange={(e) => handleFilterChange('cuisine', e.target.value)}
            SelectProps={{ native: true }}
            sx={{ minWidth: 150 }}
          >
            <option value="">All Cuisines</option>
            <option value="italian">Italian</option>
            <option value="mexican">Mexican</option>
            <option value="indian">Indian</option>
            <option value="chinese">Chinese</option>
            <option value="mediterranean">Mediterranean</option>
          </TextField>
          
          <TextField
            select
            size="small"
            label="Diet"
            value={filters.diet}
            onChange={(e) => handleFilterChange('diet', e.target.value)}
            SelectProps={{ native: true }}
            sx={{ minWidth: 150 }}
          >
            <option value="">All Diets</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto</option>
            <option value="gluten-free">Gluten Free</option>
          </TextField>
          
          <TextField
            select
            size="small"
            label="Cooking Time"
            value={filters.time}
            onChange={(e) => handleFilterChange('time', e.target.value)}
            SelectProps={{ native: true }}
            sx={{ minWidth: 150 }}
          >
            <option value="">Any Time</option>
            <option value="15">Under 15 min</option>
            <option value="30">Under 30 min</option>
            <option value="60">Under 1 hour</option>
            <option value="120">Under 2 hours</option>
          </TextField>
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilters({ cuisine: '', diet: '', time: '' })}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton width="60%" height={32} />
                  <Skeleton width="40%" height={24} sx={{ mt: 1 }} />
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Skeleton width={60} height={24} />
                    <Skeleton width={60} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={3}>
            {recipes?.data?.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={recipe.image || '/images/recipe-placeholder.jpg'}
                    alt={recipe.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {recipe.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {recipe.description?.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip 
                        icon={<Timer fontSize="small" />} 
                        label={`${recipe.prepTime + recipe.cookTime} min`} 
                        size="small" 
                      />
                      <Chip 
                        icon={<Restaurant fontSize="small" />} 
                        label={recipe.servings} 
                        size="small" 
                      />
                      {recipe.cuisine && (
                        <Chip 
                          label={recipe.cuisine} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2 }}>
                    <Button 
                      size="small" 
                      color="primary"
                      component={RouterLink}
                      to={`/recipes/${recipe._id}`}
                      endIcon={<LocalDining />}
                    >
                      View Recipe
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {recipes?.totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Stack spacing={2}>
                <Pagination 
                  count={recipes.totalPages} 
                  page={page} 
                  onChange={(_, value) => setPage(value)} 
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            </Box>
          )}
          
          {recipes?.data?.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recipes found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default RecipeListPage;
