import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../../features/auth/authApiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { setCredentials } from '../../features/auth/authSlice';
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
  Avatar, 
  Tabs, 
  Tab, 
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
  TabPanel,
  TabContext,
  TabList,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  PhotoCamera, 
  Link as LinkIcon, 
  Facebook, 
  Twitter, 
  Instagram, 
  YouTube,
  LinkedIn,
  GitHub,
  Web,
  Person,
  Email,
  Phone,
  Cake,
  LocationOn,
  Work,
  School,
  Favorite,
  Bookmark,
  History,
  Settings,
  Lock,
  Logout,
  Delete,
  Add as AddIcon,
  Star,
  StarBorder,
  StarHalf
} from '@mui/icons-material';
import { format } from 'date-fns';

interface ProfileFormData {
  name: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  dateOfBirth?: string;
  occupation?: string;
  education?: string;
  isPrivate: boolean;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    github?: string;
  };
  preferences: {
    emailNotifications: boolean;
    newsletter: boolean;
    darkMode: boolean;
  };
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { userInfo } = useAppSelector((state: RootState) => state.auth);
  const isOwnProfile = !username || userInfo?.username === username;
  const profileUsername = username || userInfo?.username || '';
  
  const { data: profile, isLoading, isError, refetch } = useGetUserProfileQuery(
    profileUsername,
    { skip: !profileUsername }
  );
  
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [activeTab, setActiveTab] = useState('recipes');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPhotoPreview, setCoverPhotoPreview] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<ProfileFormData>();
  
  // Set form default values when profile data is loaded
  useEffect(() => {
    if (profile) {
      const formData: Partial<ProfileFormData> = {
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        occupation: profile.occupation || '',
        education: profile.education || '',
        isPrivate: profile.isPrivate || false,
        socialMedia: {
          facebook: profile.socialMedia?.facebook || '',
          twitter: profile.socialMedia?.twitter || '',
          instagram: profile.socialMedia?.instagram || '',
          youtube: profile.socialMedia?.youtube || '',
          linkedin: profile.socialMedia?.linkedin || '',
          github: profile.socialMedia?.github || ''
        },
        preferences: {
          emailNotifications: profile.preferences?.emailNotifications ?? true,
          newsletter: profile.preferences?.newsletter ?? true,
          darkMode: profile.preferences?.darkMode ?? false
        }
      };
      
      reset(formData);
      
      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
      
      if (profile.coverPhoto) {
        setCoverPhotoPreview(profile.coverPhoto);
      }
    }
  }, [profile, reset]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      
      reader.readAsDataURL(file);
      // In a real app, you would upload the file to your server here
      // and then update the user's avatar URL
    }
  };
  
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result as string);
      };
      
      reader.readAsDataURL(file);
      // In a real app, you would upload the file to your server here
      // and then update the user's cover photo URL
    }
  };
  
  const onSubmit = async (data: ProfileFormData) => {
    try {
      const formData = new FormData();
      
      // Append all form fields to formData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'socialMedia' || key === 'preferences') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // In a real app, you would handle file uploads here
      // if (avatarFile) {
      //   formData.append('avatar', avatarFile);
      // }
      // if (coverPhotoFile) {
      //   formData.append('coverPhoto', coverPhotoFile);
      // }
      
      const updatedProfile = await updateProfile(formData).unwrap();
      
      // Update the auth state with the new user info
      if (isOwnProfile) {
        dispatch(setCredentials({ ...userInfo, ...updatedProfile }));
      }
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      
      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error('Error updating profile:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      // In a real app, you would call an API to delete the account
      // await deleteAccount().unwrap();
      
      setSnackbar({
        open: true,
        message: 'Account deleted successfully',
        severity: 'success'
      });
      
      // Redirect to home page after deletion
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete account. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleSignOut = () => {
    // In a real app, you would call the logout API and clear the auth state
    // dispatch(logout());
    navigate('/login');
  };
  
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error loading profile
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          We couldn't load the profile you're looking for.
        </Typography>
        <Button 
          variant="contained" 
          component={RouterLink}
          to="/"
        >
          Back to Home
        </Button>
      </Container>
    );
  }
  
  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Profile not found
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          The user you're looking for doesn't exist or has been deleted.
        </Typography>
        <Button 
          variant="contained" 
          component={RouterLink}
          to="/"
        >
          Back to Home
        </Button>
      </Container>
    );
  }
  
  const renderProfileHeader = () => (
    <Box sx={{ position: 'relative', mb: 4 }}>
      {/* Cover Photo */}
      <Box 
        sx={{
          height: 300,
          bgcolor: 'primary.light',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          mb: 12
        }}
      >
        {coverPhotoPreview ? (
          <Box
            component="img"
            src={coverPhotoPreview}
            alt="Cover"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Box 
            sx={{ 
              width: '100%', 
              height: '100%',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {profile.name}'s Kitchen
          </Box>
        )}
        
        {isEditing && isOwnProfile && (
          <label htmlFor="cover-photo-upload">
            <input
              accept="image/*"
              id="cover-photo-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleCoverPhotoChange}
            />
            <Button
              variant="contained"
              size="small"
              component="span"
              startIcon={<PhotoCamera />}
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
              }}
            >
              {coverPhotoPreview ? 'Change Cover' : 'Add Cover'}
            </Button>
          </label>
        )}
      </Box>
      
      {/* Profile Picture and Basic Info */}
      <Box 
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '5%',
          transform: 'translateY(50%)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'flex-end',
          width: '90%',
          zIndex: 2
        }}
      >
        <Box sx={{ position: 'relative', mr: isMobile ? 0 : 3, mb: isMobile ? 2 : 0 }}>
          <Avatar
            src={avatarPreview}
            alt={profile.name}
            sx={{
              width: 150,
              height: 150,
              border: '4px solid',
              borderColor: 'background.paper',
              boxShadow: 3,
              backgroundColor: 'primary.main',
              fontSize: '4rem',
              ...(isMobile && { mb: 2 })
            }}
          >
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          
          {isEditing && isOwnProfile && (
            <label htmlFor="avatar-upload">
              <input
                accept="image/*"
                id="avatar-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <IconButton
                color="primary"
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    backgroundColor: 'background.default',
                  },
                }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
          )}
        </Box>
        
        <Box sx={{ flexGrow: 1, textAlign: isMobile ? 'center' : 'left' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {profile.name}
            {profile.isVerified && (
              <Box component="span" sx={{ ml: 1, color: 'primary.main' }} title="Verified">
                ✓
              </Box>
            )}
          </Typography>
          
          {!isEditing && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              {profile.location && (
                <Chip 
                  icon={<LocationOn fontSize="small" />} 
                  label={profile.location} 
                  size="small" 
                  variant="outlined" 
                />
              )}
              {profile.occupation && (
                <Chip 
                  icon={<Work fontSize="small" />} 
                  label={profile.occupation} 
                  size="small" 
                  variant="outlined" 
                />
              )}
              {profile.joinedAt && (
                <Chip 
                  label={`Joined ${new Date(profile.joinedAt).getFullYear()}`} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
          )}
          
          {!isMobile && !isEditing && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {profile.socialMedia?.facebook && (
                <IconButton 
                  component="a" 
                  href={profile.socialMedia.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  color="primary"
                >
                  <Facebook />
                </IconButton>
              )}
              {profile.socialMedia?.twitter && (
                <IconButton 
                  component="a" 
                  href={profile.socialMedia.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  color="primary"
                >
                  <Twitter />
                </IconButton>
              )}
              {profile.socialMedia?.instagram && (
                <IconButton 
                  component="a" 
                  href={profile.socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  color="primary"
                >
                  <Instagram />
                </IconButton>
              )}
              {profile.website && (
                <IconButton 
                  component="a" 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  color="primary"
                >
                  <Web />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
        
        {isOwnProfile && !isEditing && (
          <Box sx={{ display: 'flex', gap: 1, mt: isMobile ? 2 : 0 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditToggle}
              size={isMobile ? 'small' : 'medium'}
            >
              Edit Profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              component={RouterLink}
              to="/settings"
              size={isMobile ? 'small' : 'medium'}
            >
              Settings
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
  
  const renderEditForm = () => (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Full Name"
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Phone Number"
                  margin="normal"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Cake />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Location"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="occupation"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Occupation"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="education"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Education"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <School />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="website"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Website"
                  margin="normal"
                  placeholder="https://example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Web />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Bio"
                  multiline
                  rows={4}
                  margin="normal"
                  placeholder="Tell us about yourself..."
                />
              )}
            />
            
            <Controller
              name="isPrivate"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label="Private Profile"
                  sx={{ mt: 2 }}
                />
              )}
            />
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
              When your profile is private, only approved followers can see your recipes and activity.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Social Media
            </Typography>
            
            <Controller
              name="socialMedia.facebook"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Facebook"
                  margin="normal"
                  placeholder="https://facebook.com/username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Facebook />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="socialMedia.twitter"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Twitter"
                  margin="normal"
                  placeholder="https://twitter.com/username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Twitter />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="socialMedia.instagram"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Instagram"
                  margin="normal"
                  placeholder="https://instagram.com/username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Instagram />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="socialMedia.youtube"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="YouTube"
                  margin="normal"
                  placeholder="https://youtube.com/username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <YouTube />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="socialMedia.linkedin"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="LinkedIn"
                  margin="normal"
                  placeholder="https://linkedin.com/in/username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkedIn />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="socialMedia.github"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="GitHub"
                  margin="normal"
                  placeholder="https://github.com/username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GitHub />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Preferences
            </Typography>
            
            <Controller
              name="preferences.emailNotifications"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
              )}
            />
            
            <Controller
              name="preferences.newsletter"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label="Subscribe to Newsletter"
                />
              )}
            />
            
            <Controller
              name="preferences.darkMode"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
              )}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setIsEditing(false);
              // Reset form to original values
              if (profile) {
                reset({
                  name: profile.name || '',
                  email: profile.email || '',
                  bio: profile.bio || '',
                  location: profile.location || '',
                  website: profile.website || '',
                  phone: profile.phone || '',
                  dateOfBirth: profile.dateOfBirth || '',
                  occupation: profile.occupation || '',
                  education: profile.education || '',
                  isPrivate: profile.isPrivate || false,
                  socialMedia: {
                    facebook: profile.socialMedia?.facebook || '',
                    twitter: profile.socialMedia?.twitter || '',
                    instagram: profile.socialMedia?.instagram || '',
                    youtube: profile.socialMedia?.youtube || '',
                    linkedin: profile.socialMedia?.linkedin || '',
                    github: profile.socialMedia?.github || ''
                  },
                  preferences: {
                    emailNotifications: profile.preferences?.emailNotifications ?? true,
                    newsletter: profile.preferences?.newsletter ?? true,
                    darkMode: profile.preferences?.darkMode ?? false
                  }
                });
              }
              setAvatarPreview(profile?.avatar || '');
              setCoverPhotoPreview(profile?.coverPhoto || '');
            }}
            startIcon={<CancelIcon />}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
  
  const renderProfileContent = () => {
    if (isEditing) {
      return renderEditForm();
    }
    
    return (
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <TabList 
            onChange={handleTabChange} 
            aria-label="profile tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Recipes" value="recipes" icon={<Restaurant />} iconPosition="start" />
            <Tab label="Favorites" value="favorites" icon={<Favorite />} iconPosition="start" />
            <Tab label="Saved" value="saved" icon={<Bookmark />} iconPosition="start" />
            <Tab label="Activity" value="activity" icon={<History />} iconPosition="start" />
            {isOwnProfile && (
              <Tab label="Settings" value="settings" icon={<Settings />} iconPosition="start" />
            )}
          </TabList>
        </Box>
        
        <TabPanel value="recipes" sx={{ p: 0 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="140"
                      image={`https://source.unsplash.com/random/400x300?food,${item}`}
                      alt="Recipe"
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="h2" noWrap>
                        Delicious Recipe {item}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        A tasty dish that will impress your guests with its amazing flavors.
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <Star color="warning" fontSize="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            4.8
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          15 mins • 4 servings
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <Button size="small" color="primary">
                      View Recipe
                    </Button>
                    {isOwnProfile && (
                      <Button size="small" color="primary">
                        Edit
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button variant="outlined">Load More</Button>
          </Box>
        </TabPanel>
        
        <TabPanel value="favorites" sx={{ p: 0 }}>
          <Typography variant="h6" gutterBottom>
            Favorite Recipes
          </Typography>
          <Typography color="text.secondary" paragraph>
            {profile.name} hasn't favorited any recipes yet.
          </Typography>
        </TabPanel>
        
        <TabPanel value="saved" sx={{ p: 0 }}>
          <Typography variant="h6" gutterBottom>
            Saved Recipes
          </Typography>
          <Typography color="text.secondary" paragraph>
            {profile.name} hasn't saved any recipes yet.
          </Typography>
        </TabPanel>
        
        <TabPanel value="activity" sx={{ p: 0 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <Restaurant />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="You created a new recipe"
                secondary="2 hours ago"
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
              <Button size="small" color="primary">View</Button>
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <Star />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="You rated a recipe 5 stars"
                secondary="1 day ago"
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
              <Button size="small" color="primary">View</Button>
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <CommentIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="You commented on a recipe"
                secondary="3 days ago"
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
              <Button size="small" color="primary">View</Button>
            </ListItem>
          </List>
        </TabPanel>
        
        {isOwnProfile && (
          <TabPanel value="settings" sx={{ p: 0 }}>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Change Password
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Lock />}
                component={RouterLink}
                to="/change-password"
              >
                Change Password
              </Button>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Preferences
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email Notifications"
                sx={{ display: 'block', mb: 1 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Push Notifications"
                sx={{ display: 'block', mb: 1 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Marketing Emails"
                sx={{ display: 'block' }}
              />
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                These actions are irreversible. Please proceed with caution.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Logout />}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </Box>
            </Paper>
          </TabPanel>
        )}
      </TabContext>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      {isUpdating && (
        <LinearProgress 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: theme.zIndex.modal + 1 
          }} 
        />
      )}
      
      {renderProfileHeader()}
      
      <Box sx={{ mt: isMobile ? 8 : 4 }}>
        {renderProfileContent()}
      </Box>
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-account-dialog-title"
      >
        <DialogTitle id="delete-account-dialog-title">
          Delete Your Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone. All your data, including recipes, comments, and favorites, will be permanently removed.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Enter your password to confirm"
            type="password"
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
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

export default ProfilePage;
