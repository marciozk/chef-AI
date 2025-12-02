import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useGetRecipeQuery, useDeleteRecipeMutation, useRateRecipeMutation } from '../../features/recipes/recipeApiSlice';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '../../features/auth/authApiSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { RootState } from '../../app/store';
import { setCredentials } from '../../features/auth/authSlice';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Chip, 
  Grid,
  Divider,
  IconButton,
  Rating,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  TabPanel,
  TabContext,
  TabList,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Edit, 
  Delete, 
  Timer, 
  Restaurant, 
  LocalDining,
  People,
  Star,
  StarHalf,
  StarBorder,
  ArrowBack,
  Share,
  Bookmark,
  BookmarkBorder,
  Comment as CommentIcon,
  Send
} from '@mui/icons-material';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { userInfo } = useAppSelector((state: RootState) => state.auth);
  const { data: recipe, isLoading, isError, refetch } = useGetRecipeQuery(id || '');
  const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation();
  const [rateRecipe] = useRateRecipeMutation();
  const [addToFavorites] = useAddToFavoritesMutation();
  const [removeFromFavorites] = useRemoveFromFavoritesMutation();
  
  const [tabValue, setTabValue] = useState('ingredients');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Check if recipe is in user's favorites
  useEffect(() => {
    if (userInfo && recipe) {
      const isFav = userInfo.favorites?.some(fav => fav._id === recipe._id);
      setIsFavorite(!!isFav);
      
      // Set user's previous rating if exists
      const userRating = recipe.ratings?.find(r => r.user === userInfo._id);
      if (userRating) {
        setUserRating(userRating.rating);
      }
    }
  }, [userInfo, recipe]);

  // Calculate average rating
  useEffect(() => {
    if (recipe?.ratings?.length) {
      const sum = recipe.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      setRating(sum / recipe.ratings.length);
    } else {
      setRating(0);
    }
  }, [recipe]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleRatingChange = async (newValue: number | null) => {
    if (!userInfo) {
      setSnackbar({
        open: true,
        message: 'Please log in to rate recipes',
        severity: 'warning'
      });
      return;
    }
    
    if (!newValue) return;
    
    try {
      const result = await rateRecipe({
        recipeId: id || '',
        rating: newValue
      }).unwrap();
      
      // Update local state
      setUserRating(newValue);
      
      // Update recipe data
      if (recipe) {
        const updatedRatings = [...(recipe.ratings || [])];
        const existingRatingIndex = updatedRatings.findIndex(r => r.user === userInfo._id);
        
        if (existingRatingIndex >= 0) {
          updatedRatings[existingRatingIndex] = { user: userInfo._id, rating: newValue };
        } else {
          updatedRatings.push({ user: userInfo._id, rating: newValue });
        }
        
        // Update the recipe object
        recipe.ratings = updatedRatings;
      }
      
      setSnackbar({
        open: true,
        message: 'Thank you for your rating!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to submit rating. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!userInfo) {
      setSnackbar({
        open: true,
        message: 'Please log in to save recipes',
        severity: 'warning'
      });
      return;
    }
    
    try {
      if (isFavorite) {
        await removeFromFavorites(id || '').unwrap();
        setSnackbar({
          open: true,
          message: 'Removed from favorites',
          severity: 'info'
        });
      } else {
        await addToFavorites(id || '').unwrap();
        setSnackbar({
          open: true,
          message: 'Added to favorites',
          severity: 'success'
        });
      }
      
      // Update local state
      setIsFavorite(!isFavorite);
      
      // Update user info in the store
      if (userInfo && recipe) {
        const updatedFavorites = isFavorite
          ? userInfo.favorites?.filter(fav => fav._id !== recipe._id) || []
          : [...(userInfo.favorites || []), { _id: recipe._id, title: recipe.title, image: recipe.image }];
        
        dispatch(setCredentials({
          ...userInfo,
          favorites: updatedFavorites
        }));
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update favorites',
        severity: 'error'
      });
    }
  };

  const handleDeleteRecipe = async () => {
    try {
      await deleteRecipe(id || '').unwrap();
      setSnackbar({
        open: true,
        message: 'Recipe deleted successfully',
        severity: 'success'
      });
      navigate('/recipes');
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete recipe',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleShareRecipe = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe?.title,
          text: `Check out this delicious recipe: ${recipe?.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setSnackbar({
          open: true,
          message: 'Link copied to clipboard!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !userInfo) return;
    
    // In a real app, you would make an API call to add the comment
    // For now, we'll just show a success message
    setSnackbar({
      open: true,
      message: 'Comment added!',
      severity: 'success'
    });
    
    setComment('');
    // Refresh comments
    refetch();
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="text" height={60} width="80%" sx={{ mb: 2 }} />
        <Skeleton variant="text" height={40} width="50%" sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={40} width="30%" sx={{ mb: 2 }} />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="text" height={24} width="100%" sx={{ mb: 1 }} />
            ))}
            
            <Skeleton variant="text" height={40} width="30%" sx={{ mt: 4, mb: 2 }} />
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} variant="text" height={24} width={i % 2 === 0 ? '90%' : '100%'} sx={{ mb: 1 }} />
            ))}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (isError || !recipe) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom>
          Recipe not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The recipe you're looking for doesn't exist or has been removed.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/recipes')}
          startIcon={<ArrowBack />}
        >
          Back to Recipes
        </Button>
      </Container>
    );
  }

  const isOwner = userInfo?._id === recipe.user?._id;
  const hasCooked = userInfo?.cookedRecipes?.some(r => r._id === recipe._id);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {/* Recipe Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {recipe.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              By {recipe.user?.name || 'Anonymous'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={handleToggleFavorite} 
              color={isFavorite ? 'error' : 'default'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            
            <IconButton 
              onClick={handleShareRecipe}
              aria-label="Share recipe"
            >
              <Share />
            </IconButton>
            
            {isOwner && (
              <>
                <IconButton 
                  component={RouterLink}
                  to={`/recipes/edit/${recipe._id}`}
                  aria-label="Edit recipe"
                  color="primary"
                >
                  <Edit />
                </IconButton>
                
                <IconButton 
                  onClick={() => setDeleteDialogOpen(true)}
                  aria-label="Delete recipe"
                  color="error"
                  disabled={isDeleting}
                >
                  {isDeleting ? <CircularProgress size={24} /> : <Delete />}
                </IconButton>
              </>
            )}
          </Box>
        </Box>
        
        {/* Recipe Image */}
        <Box 
          component="img"
          src={recipe.image || '/images/recipe-placeholder.jpg'}
          alt={recipe.title}
          sx={{
            width: '100%',
            height: '400px',
            objectFit: 'cover',
            borderRadius: 2,
            mb: 3,
            boxShadow: 3
          }}
        />
        
        {/* Recipe Meta */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          mb: 4,
          '& > *': {
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }
        }}>
          <Box>
            <Timer color="action" />
            <Typography variant="body2" color="text.secondary">
              Prep: {recipe.prepTime} min | Cook: {recipe.cookTime} min
            </Typography>
          </Box>
          
          <Box>
            <People color="action" />
            <Typography variant="body2" color="text.secondary">
              {recipe.servings} servings
            </Typography>
          </Box>
          
          <Box>
            <LocalDining color="action" />
            <Typography variant="body2" color="text.secondary">
              {recipe.cuisine}
            </Typography>
          </Box>
          
          <Box>
            <Rating 
              value={rating} 
              precision={0.5} 
              readOnly 
              size="small"
              emptyIcon={<StarBorder fontSize="inherit" />}
            />
            <Typography variant="body2" color="text.secondary">
              ({recipe.ratings?.length || 0} ratings)
            </Typography>
          </Box>
        </Box>
        
        {/* Recipe Description */}
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          {recipe.description}
        </Typography>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<BookmarkBorder />}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? 'Saved' : 'Save Recipe'}
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<Bookmark />}
            onClick={handleShareRecipe}
          >
            Share
          </Button>
          
          {!isOwner && (
            <Button 
              variant="outlined" 
              color="secondary"
              startIcon={<Restaurant />}
              onClick={() => {
                // In a real app, you would add this to the user's cooked recipes
                setSnackbar({
                  open: true,
                  message: 'Added to your cooked recipes!',
                  severity: 'success'
                });
              }}
            >
              {hasCooked ? 'Cooked Again' : 'I Made This'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Recipe Content */}
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <TabList 
                onChange={handleTabChange} 
                aria-label="recipe tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Ingredients" value="ingredients" />
                <Tab label="Instructions" value="instructions" />
                <Tab label="Nutrition" value="nutrition" />
                <Tab label={`Reviews (${recipe.comments?.length || 0})`} value="reviews" />
              </TabList>
            </Box>
            
            <TabPanel value="ingredients" sx={{ px: 0 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Ingredients
                </Typography>
                <List>
                  {recipe.ingredients?.map((ingredient, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={ingredient.name}
                        secondary={`${ingredient.amount} ${ingredient.unit}`}
                      />
                    </ListItem>
                  ))}
                </List>
                
                {recipe.notes && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Notes:
                    </Typography>
                    <Typography variant="body2">
                      {recipe.notes}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </TabPanel>
            
            <TabPanel value="instructions" sx={{ px: 0 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Instructions
                </Typography>
                <List>
                  {recipe.instructions?.map((step, index) => (
                    <ListItem key={index} sx={{ alignItems: 'flex-start' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={step.title}
                        primaryTypographyProps={{ variant: 'subtitle1' }}
                        secondary={step.description}
                        secondaryTypographyProps={{ variant: 'body1', component: 'div' }}
                      />
                      {step.image && (
                        <Box 
                          component="img"
                          src={step.image}
                          alt={`Step ${index + 1}`}
                          sx={{ 
                            width: 100, 
                            height: 100, 
                            objectFit: 'cover',
                            borderRadius: 1,
                            ml: 2
                          }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
                
                {recipe.tips && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Chef's Tips:
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {recipe.tips}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </TabPanel>
            
            <TabPanel value="nutrition" sx={{ px: 0 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Nutrition Information
                </Typography>
                {recipe.nutrition ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="h6" color="primary">
                        {recipe.nutrition.calories}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Calories
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="h6" color="primary">
                        {recipe.nutrition.protein}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Protein
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="h6" color="primary">
                        {recipe.nutrition.carbs}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Carbs
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="h6" color="primary">
                        {recipe.nutrition.fat}g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fat
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography color="text.secondary">
                    No nutrition information available for this recipe.
                  </Typography>
                )}
              </Paper>
            </TabPanel>
            
            <TabPanel value="reviews" sx={{ px: 0 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      Rate this recipe
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating
                        name="recipe-rating"
                        value={userRating}
                        onChange={(event, newValue) => handleRatingChange(newValue)}
                        precision={0.5}
                        size="large"
                        emptyIcon={<StarBorder fontSize="inherit" />}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {userRating ? 'Your rating' : 'Rate this recipe'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" component="div" color="primary">
                      {rating.toFixed(1)}
                    </Typography>
                    <Rating value={rating} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {recipe.ratings?.length || 0} ratings
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Leave a comment
                </Typography>
                
                {userInfo ? (
                  <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Share your thoughts about this recipe..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      endIcon={<Send />}
                      disabled={!comment.trim()}
                    >
                      Post Comment
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Please log in to leave a comment.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={RouterLink}
                      to="/login?redirect=/"
                    >
                      Log In
                    </Button>
                  </Box>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  {recipe.comments?.length || 'No'} comments
                </Typography>
                
                {recipe.comments?.length ? (
                  <List>
                    {recipe.comments.map((comment, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar 
                              alt={comment.user?.name || 'Anonymous'}
                              src={comment.user?.avatar}
                            >
                              {comment.user?.name?.charAt(0) || 'A'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <>
                                <Typography 
                                  component="span" 
                                  variant="subtitle2" 
                                  color="text.primary"
                                  sx={{ mr: 1 }}
                                >
                                  {comment.user?.name || 'Anonymous'}
                                </Typography>
                                <Typography 
                                  component="span" 
                                  variant="caption" 
                                  color="text.secondary"
                                >
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </Typography>
                              </>
                            }
                            secondary={
                              <>
                                <Rating 
                                  value={comment.rating} 
                                  size="small" 
                                  readOnly 
                                  sx={{ my: 0.5 }}
                                />
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {comment.text}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < recipe.comments.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No comments yet. Be the first to leave a review!
                  </Typography>
                )}
              </Paper>
            </TabPanel>
          </TabContext>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Author Card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={recipe.user?.avatar}
                alt={recipe.user?.name}
                sx={{ width: 64, height: 64, mr: 2 }}
              >
                {recipe.user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {recipe.user?.name || 'Anonymous Chef'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recipe.user?.recipes?.length || 0} recipes
                </Typography>
              </Box>
            </Box>
            
            {recipe.user?.bio && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {recipe.user.bio}
              </Typography>
            )}
            
            <Button 
              variant="outlined" 
              size="small" 
              fullWidth
              component={RouterLink}
              to={`/chef/${recipe.user?._id}`}
            >
              View Profile
            </Button>
          </Paper>
          
          {/* Similar Recipes */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              You Might Also Like
            </Typography>
            
            {recipe.similarRecipes?.length ? (
              <List>
                {recipe.similarRecipes.map((similar, index) => (
                  <React.Fragment key={index}>
                    <ListItem 
                      button 
                      component={RouterLink}
                      to={`/recipes/${similar._id}`}
                      sx={{ px: 0 }}
                    >
                      <Box 
                        component="img"
                        src={similar.image || '/images/recipe-placeholder.jpg'}
                        alt={similar.title}
                        sx={{ 
                          width: 80, 
                          height: 60, 
                          objectFit: 'cover',
                          borderRadius: 1,
                          mr: 2
                        }}
                      />
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle2" noWrap>
                            {similar.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {similar.user?.name || 'Anonymous'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recipe.similarRecipes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No similar recipes found.
              </Typography>
            )}
          </Paper>
          
          {/* Recipe Tags */}
          {recipe.tags?.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {recipe.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    component={RouterLink}
                    to={`/recipes?tag=${tag}`}
                    clickable
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Recipe
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this recipe? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteRecipe} 
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : <Delete />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
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

export default RecipeDetailPage;
