import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useCreateRecipeMutation, useUpdateRecipeMutation, useGetRecipeQuery } from '../../features/recipes/recipeApiSlice';
import { useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  Grid, 
  IconButton, 
  Divider, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormLabel,
  InputAdornment,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  PhotoCamera, 
  ArrowBack,
  Save,
  Cancel,
  LocalDining,
  Restaurant,
  Timer,
  People,
  Description,
  Kitchen,
  Fastfood,
  FitnessCenter,
  Notes,
  CheckCircle
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Types
type Ingredient = {
  name: string;
  amount: string;
  unit: string;
};

type InstructionStep = {
  title: string;
  description: string;
  image?: string;
};

type FormData = {
  title: string;
  description: string;
  prepTime: Date | null;
  cookTime: Date | null;
  servings: number;
  cuisine: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  tags: string[];
  notes?: string;
  tips?: string;
  image?: FileList;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
};

const cuisines = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'French', 'Other'
];

const units = [
  'tsp', 'tbsp', 'cup', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'pinch', 'dash', 'to taste'
];

const RecipeFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { userInfo } = useAppSelector((state: RootState) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const { data: recipe, isLoading: isLoadingRecipe } = useGetRecipeQuery(id || '', { skip: !isEditMode });
  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();
  
  const isLoading = isCreating || isUpdating || (isEditMode && isLoadingRecipe);
  
  const { 
    control, 
    handleSubmit, 
    register, 
    formState: { errors }, 
    setValue, 
    watch,
    reset
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      prepTime: null,
      cookTime: null,
      servings: 4,
      cuisine: '',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isDairyFree: false,
      ingredients: [{ name: '', amount: '', unit: 'tsp' }],
      instructions: [{ title: '', description: '' }],
      tags: [],
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
      }
    }
  });
  
  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = 
    useFieldArray({ control, name: 'ingredients' });
    
  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = 
    useFieldArray({ control, name: 'instructions' });
  
  const tags = watch('tags');
  
  // Load recipe data in edit mode
  useEffect(() => {
    if (isEditMode && recipe) {
      // Format the recipe data to match the form
      const formData = {
        ...recipe,
        prepTime: recipe.prepTime ? new Date(0, 0, 0, 0, recipe.prepTime) : null,
        cookTime: recipe.cookTime ? new Date(0, 0, 0, 0, recipe.cookTime) : null,
        ingredients: recipe.ingredients?.length ? recipe.ingredients : [{ name: '', amount: '', unit: 'tsp' }],
        instructions: recipe.instructions?.length ? recipe.instructions : [{ title: '', description: '' }],
        tags: recipe.tags || [],
        nutrition: recipe.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0
        }
      };
      
      reset(formData);
      
      if (recipe.image) {
        setImagePreview(recipe.image);
      }
    }
  }, [isEditMode, recipe, reset]);
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const formatTimeToMinutes = (date: Date | null): number => {
    if (!date) return 0;
    return date.getHours() * 60 + date.getMinutes();
  };
  
  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      
      // Add all fields to form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image') return; // Handle image separately
        if (key === 'prepTime' || key === 'cookTime') {
          formData.append(key, formatTimeToMinutes(value as Date).toString());
        } else if (key === 'ingredients' || key === 'instructions') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'nutrition') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // Add image if it's a new file
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }
      
      if (isEditMode && id) {
        await updateRecipe({ id, recipeData: formData }).unwrap();
        setSnackbar({
          open: true,
          message: 'Recipe updated successfully!',
          severity: 'success'
        });
      } else {
        await createRecipe(formData).unwrap();
        setSnackbar({
          open: true,
          message: 'Recipe created successfully!',
          severity: 'success'
        });
        navigate('/my-recipes');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save recipe. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const steps = [
    { label: 'Basic Information', icon: <Description /> },
    { label: 'Ingredients', icon: <Kitchen /> },
    { label: 'Instructions', icon: <Restaurant /> },
    { label: 'Nutrition & Tags', icon: <FitnessCenter /> },
    { label: 'Review & Submit', icon: <CheckCircle /> }
  ];
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="recipe-image-upload"
                  type="file"
                  {...register('image')}
                  onChange={handleImageChange}
                />
                <label htmlFor="recipe-image-upload">
                  <Box 
                    sx={{
                      width: '100%',
                      height: 300,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        borderColor: 'primary.main',
                        '& .overlay': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    {imagePreview ? (
                      <>
                        <Box
                          component="img"
                          src={imagePreview}
                          alt="Recipe preview"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <Box
                          className="overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s',
                          }}
                        >
                          <PhotoCamera sx={{ color: 'white', fontSize: 40 }} />
                          <Typography variant="body1" color="white" sx={{ ml: 1 }}>
                            Change Image
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <PhotoCamera sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          Click to upload a photo of your dish
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Recommended size: 1200x800px
                        </Typography>
                      </>
                    )}
                  </Box>
                </label>
                {errors.image && (
                  <FormHelperText error>{errors.image.message}</FormHelperText>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Recipe Title"
                variant="outlined"
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title}
                helperText={errors.title?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalDining />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="cuisine"
                control={control}
                rules={{ required: 'Cuisine is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.cuisine}>
                    <InputLabel>Cuisine</InputLabel>
                    <Select
                      {...field}
                      label="Cuisine"
                      startAdornment={
                        <InputAdornment position="start">
                          <Restaurant />
                        </InputAdornment>
                      }
                    >
                      {cuisines.map((cuisine) => (
                        <MenuItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.cuisine && (
                      <FormHelperText>{errors.cuisine.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                {...register('description', { required: 'Description is required' })}
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Tell us about your recipe..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="prepTime"
                control={control}
                rules={{ required: 'Prep time is required' }}
                render={({ field: { onChange, value } }) => (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Prep Time"
                      value={value}
                      onChange={onChange}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          error={!!errors.prepTime}
                          helperText={errors.prepTime?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Timer />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="cookTime"
                control={control}
                rules={{ required: 'Cook time is required' }}
                render={({ field: { onChange, value } }) => (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Cook Time"
                      value={value}
                      onChange={onChange}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          error={!!errors.cookTime}
                          helperText={errors.cookTime?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Timer />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Servings"
                type="number"
                {...register('servings', { 
                  required: 'Number of servings is required',
                  min: { value: 1, message: 'Must be at least 1' },
                  max: { value: 100, message: 'Maximum is 100' }
                })}
                error={!!errors.servings}
                helperText={errors.servings?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <People />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormLabel component="legend" sx={{ mb: 1, display: 'block' }}>
                Dietary Information
              </FormLabel>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="isVegetarian"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            {...field}
                            checked={field.value}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Vegetarian"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="isVegan"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            {...field}
                            checked={field.value}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Vegan"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="isGlutenFree"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            {...field}
                            checked={field.value}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Gluten Free"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="isDairyFree"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            {...field}
                            checked={field.value}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label="Dairy Free"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Ingredients
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              List all the ingredients needed for this recipe.
            </Typography>
            
            {ingredientFields.map((field, index) => (
              <Box key={field.id} sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Ingredient Name"
                      variant="outlined"
                      {...register(`ingredients.${index}.name` as const, { 
                        required: 'Ingredient name is required' 
                      })}
                      error={!!errors.ingredients?.[index]?.name}
                      helperText={errors.ingredients?.[index]?.name?.message}
                    />
                  </Grid>
                  <Grid item xs={5} sm={3}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      step="0.1"
                      {...register(`ingredients.${index}.amount` as const, { 
                        required: 'Amount is required',
                        min: { value: 0.1, message: 'Must be greater than 0' }
                      })}
                      error={!!errors.ingredients?.[index]?.amount}
                      helperText={errors.ingredients?.[index]?.amount?.message}
                    />
                  </Grid>
                  <Grid item xs={5} sm={3}>
                    <Controller
                      name={`ingredients.${index}.unit` as const}
                      control={control}
                      defaultValue="tsp"
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Unit</InputLabel>
                          <Select {...field} label="Unit">
                            {units.map((unit) => (
                              <MenuItem key={unit} value={unit}>
                                {unit}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    {ingredientFields.length > 1 && (
                      <IconButton 
                        onClick={() => removeIngredient(index)}
                        color="error"
                        aria-label="remove ingredient"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => appendIngredient({ name: '', amount: '', unit: 'tsp' })}
              sx={{ mt: 1 }}
            >
              Add Ingredient
            </Button>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add step-by-step instructions for preparing your recipe.
            </Typography>
            
            {instructionFields.map((field, index) => (
              <Box key={field.id} sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Step {index + 1}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Step Title (optional)"
                      variant="outlined"
                      {...register(`instructions.${index}.title` as const)}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Instructions"
                      variant="outlined"
                      multiline
                      rows={3}
                      {...register(`instructions.${index}.description` as const, { 
                        required: 'Instructions are required' 
                      })}
                      error={!!errors.instructions?.[index]?.description}
                      helperText={errors.instructions?.[index]?.description?.message}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id={`step-image-${index}`}
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setValue(
                              `instructions.${index}.image` as const,
                              reader.result as string
                            );
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor={`step-image-${index}`}>
                      <Button 
                        variant="outlined" 
                        component="span"
                        startIcon={<PhotoCamera />}
                        sx={{ mt: 1 }}
                      >
                        Add Step Photo
                      </Button>
                    </label>
                    
                    {watch(`instructions.${index}.image`) && (
                      <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                        <Box
                          component="img"
                          src={watch(`instructions.${index}.image`)}
                          alt={`Step ${index + 1}`}
                          sx={{ 
                            maxWidth: '100%', 
                            maxHeight: 150, 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => setValue(`instructions.${index}.image` as const, '')}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {instructionFields.length > 1 && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => removeInstruction(index)}
                        size="small"
                      >
                        Remove Step
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => appendInstruction({ title: '', description: '' })}
              sx={{ mt: 1 }}
            >
              Add Step
            </Button>
          </Box>
        );
        
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Nutrition Information (per serving)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Providing nutrition information is optional but helpful for others.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      label="Calories"
                      type="number"
                      {...register('nutrition.calories', { 
                        min: { value: 0, message: 'Must be 0 or more' }
                      })}
                      error={!!errors.nutrition?.calories}
                      helperText={errors.nutrition?.calories?.message}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      label="Protein (g)"
                      type="number"
                      step="0.1"
                      {...register('nutrition.protein', { 
                        min: { value: 0, message: 'Must be 0 or more' }
                      })}
                      error={!!errors.nutrition?.protein}
                      helperText={errors.nutrition?.protein?.message}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      label="Carbs (g)"
                      type="number"
                      step="0.1"
                      {...register('nutrition.carbs', { 
                        min: { value: 0, message: 'Must be 0 or more' }
                      })}
                      error={!!errors.nutrition?.carbs}
                      helperText={errors.nutrition?.carbs?.message}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      label="Fat (g)"
                      type="number"
                      step="0.1"
                      {...register('nutrition.fat', { 
                        min: { value: 0, message: 'Must be 0 or more' }
                      })}
                      error={!!errors.nutrition?.fat}
                      helperText={errors.nutrition?.fat?.message}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      label="Fiber (g)"
                      type="number"
                      step="0.1"
                      {...register('nutrition.fiber', { 
                        min: { value: 0, message: 'Must be 0 or more' }
                      })}
                      error={!!errors.nutrition?.fiber}
                      helperText={errors.nutrition?.fiber?.message}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      label="Sugar (g)"
                      type="number"
                      step="0.1"
                      {...register('nutrition.sugar', { 
                        min: { value: 0, message: 'Must be 0 or more' }
                      })}
                      error={!!errors.nutrition?.sugar}
                      helperText={errors.nutrition?.sugar?.message}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add tags to help others find your recipe (e.g., 'quick-meal', 'dinner', 'gluten-free').
                </Typography>
                
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    sx={{ mr: 1 }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 40 }}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {tags.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No tags added yet
                    </Typography>
                  )}
                </Box>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Additional Notes
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add any additional notes, tips, or variations for this recipe.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Notes (optional)"
                  variant="outlined"
                  multiline
                  rows={3}
                  {...register('notes')}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Chef's Tips (optional)"
                  variant="outlined"
                  multiline
                  rows={3}
                  {...register('tips')}
                  placeholder="Share any special techniques or serving suggestions..."
                />
              </Paper>
            </Grid>
          </Grid>
        );
        
      case 4:
        const formData = watch();
        
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Recipe
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please review all the information before submitting your recipe.
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box 
                    sx={{
                      width: '100%',
                      height: 200,
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {imagePreview ? (
                      <Box
                        component="img"
                        src={imagePreview}
                        alt={formData.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary' }} />
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                    {formData.title || 'Untitled Recipe'}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {formData.description || 'No description provided.'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Chip 
                      icon={<Timer />} 
                      label={`Prep: ${formData.prepTime ? formatTimeToMinutes(formData.prepTime) : '--'} min`} 
                      size="small"
                      variant="outlined"
                    />
                    <Chip 
                      icon={<Timer />} 
                      label={`Cook: ${formData.cookTime ? formatTimeToMinutes(formData.cookTime) : '--'} min`} 
                      size="small"
                      variant="outlined"
                    />
                    <Chip 
                      icon={<People />} 
                      label={`${formData.servings} servings`} 
                      size="small"
                      variant="outlined"
                    />
                    {formData.cuisine && (
                      <Chip 
                        label={formData.cuisine} 
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.isVegetarian && <Chip label="Vegetarian" size="small" color="success" />}
                    {formData.isVegan && <Chip label="Vegan" size="small" color="success" variant="outlined" />}
                    {formData.isGlutenFree && <Chip label="Gluten Free" size="small" color="info" />}
                    {formData.isDairyFree && <Chip label="Dairy Free" size="small" color="info" variant="outlined" />}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Ingredients ({formData.ingredients?.length || 0})
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                    {formData.ingredients?.length ? (
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {formData.ingredients.map((ing, i) => (
                          <li key={i}>
                            <Typography variant="body2">
                              {ing.amount} {ing.unit} {ing.name}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No ingredients added.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Instructions ({formData.instructions?.length || 0} steps)
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                    {formData.instructions?.length ? (
                      <ol style={{ margin: 0, paddingLeft: 20 }}>
                        {formData.instructions.slice(0, 3).map((step, i) => (
                          <li key={i}>
                            <Typography variant="body2" noWrap>
                              {step.title || `Step ${i + 1}`}
                            </Typography>
                          </li>
                        ))}
                        {formData.instructions.length > 3 && (
                          <Typography variant="body2" color="text.secondary">
                            ...and {formData.instructions.length - 3} more steps
                          </Typography>
                        )}
                      </ol>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No instructions added.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                {tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {tags.map((tag, i) => (
                        <Chip key={i} label={tag} size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}
                
                {(formData.notes || formData.tips) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Notes & Tips
                    </Typography>
                    {formData.notes && (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="body2" whiteSpace="pre-line">
                          {formData.notes}
                        </Typography>
                      </Paper>
                    )}
                    {formData.tips && (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Chef's Tips:
                        </Typography>
                        <Typography variant="body2" whiteSpace="pre-line">
                          {formData.tips}
                        </Typography>
                      </Paper>
                    )}
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setActiveStep(0)}
                >
                  Edit Recipe
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                >
                  {isEditMode ? 'Update Recipe' : 'Publish Recipe'}
                </Button>
              </Box>
            </Box>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  // If it's an edit page and still loading the recipe, show loading state
  if (isEditMode && isLoadingRecipe) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Check if user is authorized to edit this recipe
  if (isEditMode && !isLoadingRecipe && userInfo?._id !== recipe?.user?._id) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Unauthorized Access
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          You don't have permission to edit this recipe.
        </Typography>
        <Button 
          variant="contained" 
          component={RouterLink}
          to="/my-recipes"
        >
          Back to My Recipes
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          component={RouterLink}
          to={isEditMode ? `/recipes/${id}` : '/my-recipes'}
          sx={{ mr: 2 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
        </Typography>
      </Box>
      
      <Stepper 
        activeStep={activeStep} 
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{ mb: 4 }}
      >
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel 
              icon={step.icon}
              sx={{ '& .MuiStepLabel-label': { mt: 0.5 } }}
            >
              {!isMobile && step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        {renderStepContent(activeStep)}
      </Paper>
      
      {activeStep < steps.length - 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={() => {
              if (activeStep === steps.length - 2) {
                handleSubmit(handleNext)();
              } else {
                handleNext();
              }
            }}
            endIcon={activeStep === steps.length - 2 ? <Save /> : null}
          >
            {activeStep === steps.length - 2 ? 'Review Recipe' : 'Continue'}
          </Button>
        </Box>
      )}
      
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

export default RecipeFormPage;
