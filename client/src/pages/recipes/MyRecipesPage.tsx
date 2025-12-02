import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useGetMyRecipesQuery, useDeleteRecipeMutation, useUpdateRecipeStatusMutation } from '../../features/recipes/recipeApiSlice';
import { useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  CardActions,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Divider,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Timer as TimerIcon,
  Restaurant as RestaurantIcon,
  LocalDining as LocalDiningIcon,
  Sort as SortIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  DeleteSweep as DeleteSweepIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

type Order = 'asc' | 'desc';

interface RecipeData {
  _id: string;
  title: string;
  image?: string;
  rating: number;
  reviews: number;
  prepTime: number;
  cookTime: number;
  servings: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
  favorites: number;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
}

const MyRecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { userInfo } = useAppSelector((state: RootState) => state.auth);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof RecipeData>('updatedAt');
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Fetch recipes with filters
  const { data, isLoading, isError, refetch } = useGetMyRecipesQuery({
    page: page + 1,
    limit: rowsPerPage,
    sort: `${order === 'desc' ? '-' : ''}${orderBy}`,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    featured: featuredFilter !== 'all' ? (featuredFilter === 'featured') : undefined
  });
  
  const [deleteRecipe] = useDeleteRecipeMutation();
  const [updateRecipeStatus] = useUpdateRecipeStatusMutation();
  
  const recipes = data?.data || [];
  const totalRecipes = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  
  // Handle sort request
  const handleRequestSort = (property: keyof RecipeData) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset to first page when sorting
  };
  
  // Handle select all click
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = recipes.map((recipe) => recipe._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
  
  // Handle row click
  const handleClick = (event: React.MouseEvent, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];
    
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    
    setSelected(newSelected);
  };
  
  // Handle change page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle change rows per page
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Handle featured filter change
  const handleFeaturedFilterChange = (event: any) => {
    setFeaturedFilter(event.target.value);
    setPage(0);
  };
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle sort menu open
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };
  
  // Handle sort menu close
  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };
  
  // Handle sort selection
  const handleSortSelect = (property: keyof RecipeData) => {
    setOrderBy(property);
    setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc');
    setSortMenuAnchor(null);
    setPage(0);
  };
  
  // Handle delete recipe
  const handleDeleteRecipe = async (id: string) => {
    try {
      await deleteRecipe(id).unwrap();
      setSnackbar({
        open: true,
        message: 'Recipe deleted successfully',
        severity: 'success'
      });
      // Remove from selected
      setSelected(selected.filter(item => item !== id));
      // Refetch recipes
      refetch();
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete recipe',
        severity: 'error'
      });
    }
  };
  
  // Handle bulk action
  const handleBulkAction = async (action: string) => {
    if (selected.length === 0) return;
    
    try {
      switch (action) {
        case 'publish':
          await Promise.all(
            selected.map(id => 
              updateRecipeStatus({ 
                id, 
                status: 'published' 
              }).unwrap()
            )
          );
          setSnackbar({
            open: true,
            message: `${selected.length} recipe(s) published successfully`,
            severity: 'success'
          });
          break;
          
        case 'unpublish':
          await Promise.all(
            selected.map(id => 
              updateRecipeStatus({ 
                id, 
                status: 'draft' 
              }).unwrap()
            )
          );
          setSnackbar({
            open: true,
            message: `${selected.length} recipe(s) unpublished successfully`,
            severity: 'success'
          });
          break;
          
        case 'archive':
          await Promise.all(
            selected.map(id => 
              updateRecipeStatus({ 
                id, 
                status: 'archived' 
              }).unwrap()
            )
          );
          setSnackbar({
            open: true,
            message: `${selected.length} recipe(s) archived successfully`,
            severity: 'success'
          });
          break;
          
        case 'delete':
          setBulkAction('delete');
          setDeleteDialogOpen(true);
          return; // Don't clear selection yet
          
        default:
          break;
      }
      
      // Clear selection after successful action
      setSelected([]);
      // Refetch recipes
      refetch();
      
    } catch (err) {
      console.error('Error performing bulk action:', err);
      setSnackbar({
        open: true,
        message: 'Failed to perform bulk action',
        severity: 'error'
      });
    }
  };
  
  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        selected.map(id => deleteRecipe(id).unwrap())
      );
      
      setSnackbar({
        open: true,
        message: `${selected.length} recipe(s) deleted successfully`,
        severity: 'success'
      });
      
      // Clear selection and close dialog
      setSelected([]);
      setDeleteDialogOpen(false);
      // Refetch recipes
      refetch();
      
    } catch (err) {
      console.error('Error deleting recipes:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete recipes',
        severity: 'error'
      });
      setDeleteDialogOpen(false);
    }
  };
  
  // Toggle recipe featured status
  const toggleFeatured = async (id: string, isCurrentlyFeatured: boolean) => {
    try {
      await updateRecipeStatus({ 
        id, 
        isFeatured: !isCurrentlyFeatured 
      }).unwrap();
      
      setSnackbar({
        open: true,
        message: `Recipe ${!isCurrentlyFeatured ? 'added to' : 'removed from'} featured`,
        severity: 'success'
      });
      
      // Refetch recipes
      refetch();
      
    } catch (err) {
      console.error('Error toggling featured status:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update featured status',
        severity: 'error'
      });
    }
  };
  
  // Check if a row is selected
  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  
  // Format date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  // Render rating stars
  const renderRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarIcon key={i} color="warning" fontSize="small" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalfIcon key={i} color="warning" fontSize="small" />);
      } else {
        stars.push(<StarBorderIcon key={i} color="warning" fontSize="small" />);
      }
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {stars}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
          ({rating.toFixed(1)})
        </Typography>
      </Box>
    );
  };
  
  // Render status chip
  const renderStatusChip = (status: string) => {
    switch (status) {
      case 'published':
        return <Chip label="Published" color="success" size="small" variant="outlined" />;
      case 'draft':
        return <Chip label="Draft" color="default" size="small" variant="outlined" />;
      case 'archived':
        return <Chip label="Archived" color="secondary" size="small" variant="outlined" />;
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 8,
      textAlign: 'center'
    }}>
      <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        No recipes found
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {searchTerm || statusFilter !== 'all' || featuredFilter !== 'all' 
          ? 'Try adjusting your search or filter criteria.'
          : 'Get started by creating your first recipe.'}
      </Typography>
      {!searchTerm && statusFilter === 'all' && featuredFilter === 'all' && (
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/recipes/new')}
          sx={{ mt: 2 }}
        >
          Create Recipe
        </Button>
      )}
    </Box>
  );
  
  // Loading state
  if (isLoading && page === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error loading recipes
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => refetch()}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Recipes
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/recipes/new')}
        >
          New Recipe
        </Button>
      </Box>
      
      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={handleClearSearch}
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Featured</InputLabel>
              <Select
                value={featuredFilter}
                onChange={handleFeaturedFilterChange}
                label="Featured"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="not_featured">Not Featured</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleSortMenuOpen}
              sx={{ justifyContent: 'flex-start' }}
            >
              Sort
            </Button>
            <Menu
              anchorEl={sortMenuAnchor}
              open={Boolean(sortMenuAnchor)}
              onClose={handleSortMenuClose}
            >
              <MenuItem onClick={() => handleSortSelect('title')}>
                <ListItemIcon>
                  {orderBy === 'title' && order === 'asc' ? (
                    <CheckBoxIcon fontSize="small" />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="small" sx={{ visibility: 'hidden' }} />
                  )}
                </ListItemIcon>
                <ListItemText>Title {orderBy === 'title' ? (order === 'asc' ? '↑' : '↓') : ''}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect('createdAt')}>
                <ListItemIcon>
                  {orderBy === 'createdAt' && order === 'desc' ? (
                    <CheckBoxIcon fontSize="small" />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="small" sx={{ visibility: 'hidden' }} />
                  )}
                </ListItemIcon>
                <ListItemText>Date Created {orderBy === 'createdAt' ? (order === 'desc' ? '↓' : '↑') : ''}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect('updatedAt')}>
                <ListItemIcon>
                  {orderBy === 'updatedAt' && order === 'desc' ? (
                    <CheckBoxIcon fontSize="small" />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="small" sx={{ visibility: 'hidden' }} />
                  )}
                </ListItemIcon>
                <ListItemText>Last Updated {orderBy === 'updatedAt' ? (order === 'desc' ? '↓' : '↑') : ''}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect('views')}>
                <ListItemIcon>
                  {orderBy === 'views' && order === 'desc' ? (
                    <CheckBoxIcon fontSize="small" />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="small" sx={{ visibility: 'hidden' }} />
                  )}
                </ListItemIcon>
                <ListItemText>Most Viewed {orderBy === 'views' ? (order === 'desc' ? '↓' : '↑') : ''}</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSortSelect('favorites')}>
                <ListItemIcon>
                  {orderBy === 'favorites' && order === 'desc' ? (
                    <CheckBoxIcon fontSize="small" />
                  ) : (
                    <CheckBoxOutlineBlankIcon fontSize="small" sx={{ visibility: 'hidden' }} />
                  )}
                </ListItemIcon>
                <ListItemText>Most Favorited {orderBy === 'favorites' ? (order === 'desc' ? '↓' : '↑') : ''}</ListItemText>
              </MenuItem>
            </Menu>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={() => {
                // Reset all filters
                setSearchTerm('');
                setStatusFilter('all');
                setFeaturedFilter('all');
                setPage(0);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Bulk Actions Toolbar */}
      {selected.length > 0 && (
        <Paper 
          sx={{ 
            p: 1, 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'action.selected',
            position: 'sticky',
            top: 64,
            zIndex: 10,
            boxShadow: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {selected.length} selected
            </Typography>
            
            <Tooltip title="Publish">
              <IconButton 
                size="small" 
                onClick={() => handleBulkAction('publish')}
                color="primary"
              >
                <PublishIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Unpublish">
              <IconButton 
                size="small" 
                onClick={() => handleBulkAction('unpublish')}
                color="primary"
              >
                <UnpublishedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                onClick={() => handleBulkAction('delete')}
                color="error"
              >
                <DeleteSweepIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={() => setSelected([])}
            color="inherit"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}
      
      {/* Recipes Table */}
      {recipes.length > 0 ? (
        <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader aria-label="recipes table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < recipes.length}
                      checked={recipes.length > 0 && selected.length === recipes.length}
                      onChange={handleSelectAllClick}
                      inputProps={{ 'aria-label': 'select all recipes' }}
                    />
                  </TableCell>
                  <TableCell>Recipe</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell align="center">Views</TableCell>
                  <TableCell align="center">Favorites</TableCell>
                  <TableCell align="right">Last Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recipes.map((recipe) => {
                  const isItemSelected = isSelected(recipe._id);
                  const labelId = `recipe-checkbox-${recipe._id}`;
                  
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={recipe._id}
                      selected={isItemSelected}
                      onClick={(event) => handleClick(event, recipe._id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            component="img"
                            src={recipe.image || '/images/recipe-placeholder.jpg'}
                            alt={recipe.title}
                            sx={{ 
                              width: 60, 
                              height: 40, 
                              objectFit: 'cover',
                              borderRadius: 1,
                              mr: 2
                            }}
                          />
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              noWrap 
                              sx={{ maxWidth: 300 }}
                            >
                              {recipe.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip 
                                icon={<TimerIcon fontSize="small" />} 
                                label={`${recipe.prepTime + recipe.cookTime}m`} 
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
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {renderStatusChip(recipe.status)}
                      </TableCell>
                      <TableCell align="center">
                        {recipe.rating > 0 ? (
                          <Tooltip title={`${recipe.rating.toFixed(1)} (${recipe.reviews} reviews)`}>
                            <Box>{renderRating(recipe.rating)}</Box>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No ratings
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {recipe.views.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {recipe.favorites.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatDate(recipe.updatedAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(recipe.updatedAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title={recipe.isFeatured ? "Remove from featured" : "Add to featured"}>
                            <IconButton 
                              size="small" 
                              color={recipe.isFeatured ? "warning" : "default"}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFeatured(recipe._id, recipe.isFeatured);
                              }}
                            >
                              {recipe.isFeatured ? <StarIcon /> : <StarBorderIcon />}
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Duplicate">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle duplicate
                                setSnackbar({
                                  open: true,
                                  message: 'Duplicate functionality coming soon',
                                  severity: 'info'
                                });
                              }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setAnchorEl(e.currentTarget);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MenuItem 
                              onClick={() => {
                                navigate(`/recipes/edit/${recipe._id}`);
                                handleMenuClose();
                              }}
                            >
                              <ListItemIcon>
                                <EditIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText>Edit</ListItemText>
                            </MenuItem>
                            
                            <MenuItem 
                              onClick={() => {
                                navigate(`/recipes/${recipe._id}`);
                                handleMenuClose();
                              }}
                            >
                              <ListItemIcon>
                                <VisibilityIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText>View</ListItemText>
                            </MenuItem>
                            
                            <Divider />
                            
                            <MenuItem 
                              onClick={() => {
                                handleBulkAction(recipe.status === 'published' ? 'unpublish' : 'publish');
                                handleMenuClose();
                              }}
                            >
                              <ListItemIcon>
                                {recipe.status === 'published' ? (
                                  <VisibilityOffIcon fontSize="small" />
                                ) : (
                                  <PublishIcon fontSize="small" />
                                )}
                              </ListItemIcon>
                              <ListItemText>
                                {recipe.status === 'published' ? 'Unpublish' : 'Publish'}
                              </ListItemText>
                            </MenuItem>
                            
                            <MenuItem 
                              onClick={() => {
                                handleBulkAction('archive');
                                handleMenuClose();
                              }}
                            >
                              <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText>Archive</ListItemText>
                            </MenuItem>
                            
                            <Divider />
                            
                            <MenuItem 
                              onClick={() => {
                                setSelected([recipe._id]);
                                setDeleteDialogOpen(true);
                                handleMenuClose();
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <ListItemIcon sx={{ color: 'error.main' }}>
                                <DeleteIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText>Delete</ListItemText>
                            </MenuItem>
                          </Menu>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalRecipes}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Recipes per page:"
            sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
          />
        </Paper>
      ) : (
        renderEmptyState()
      )}
      
      {/* Mobile View - Card Layout */}
      {isMobile && recipes.length > 0 && (
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
          {recipes.map((recipe) => {
            const isItemSelected = isSelected(recipe._id);
            
            return (
              <Card 
                key={recipe._id} 
                sx={{ 
                  mb: 2,
                  border: isItemSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                  position: 'relative',
                  overflow: 'visible'
                }}
                onClick={(event) => handleClick(event, recipe._id)}
              >
                <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                  <Checkbox
                    checked={isItemSelected}
                    onClick={(e) => e.stopPropagation()}
                    inputProps={{ 'aria-label': `select recipe ${recipe.title}` }}
                    color="primary"
                    sx={{ 
                      backgroundColor: 'background.paper',
                      borderRadius: '50%',
                      p: 0.5
                    }}
                  />
                </Box>
                
                <CardActionArea>
                  <Box sx={{ display: 'flex' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 120, height: 100, objectFit: 'cover' }}
                      image={recipe.image || '/images/recipe-placeholder.jpg'}
                      alt={recipe.title}
                    />
                    <CardContent sx={{ flex: 1, p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" noWrap sx={{ maxWidth: '70%' }}>
                          {recipe.title}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            color={recipe.isFeatured ? "warning" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFeatured(recipe._id, recipe.isFeatured);
                            }}
                          >
                            {recipe.isFeatured ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, mb: 1 }}>
                        {renderStatusChip(recipe.status)}
                        {recipe.rating > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                            <StarIcon color="warning" fontSize="small" />
                            <Typography variant="body2" sx={{ ml: 0.25 }}>
                              {recipe.rating.toFixed(1)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={<TimerIcon fontSize="small" />} 
                          label={`${recipe.prepTime + recipe.cookTime}m`} 
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
                  </Box>
                </CardActionArea>
                
                <CardActions sx={{ display: 'flex', justifyContent: 'space-between', p: 1, pt: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(recipe.updatedAt)}
                  </Typography>
                  
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/recipes/edit/${recipe._id}`);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected([recipe._id]);
                        setDeleteDialogOpen(true);
                      }}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            );
          })}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page + 1} 
              onChange={(e, value) => setPage(value - 1)}
              color="primary"
              showFirstButton 
              showLastButton
            />
          </Box>
        </Box>
      )}
      
      {/* Stats Summary */}
      {!isMobile && recipes.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" color="primary">
                {data?.stats?.totalRecipes || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Recipes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" color="success.main">
                {data?.stats?.publishedRecipes || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Published
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5">
                {data?.stats?.totalViews?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Views
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" color="warning.main">
                {data?.stats?.totalFavorites?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Favorites
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          {bulkAction === 'delete' && selected.length > 1 
            ? `Delete ${selected.length} Recipes?` 
            : 'Delete Recipe?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {bulkAction === 'delete' && selected.length > 1 
              ? `Are you sure you want to delete these ${selected.length} recipes? This action cannot be undone.`
              : 'Are you sure you want to delete this recipe? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={bulkAction === 'delete' ? confirmBulkDelete : () => {
              if (selected.length === 1) {
                handleDeleteRecipe(selected[0]);
                setDeleteDialogOpen(false);
              }
            }} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
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

export default MyRecipesPage;
