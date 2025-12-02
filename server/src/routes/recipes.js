const express = require('express');
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  recipePhotoUpload,
  addRecipeRating,
  toggleFavoriteRecipe,
  getTopRatedRecipes,
  getRecipesByUser,
  getUserFavorites
} = require('../controllers/recipes');

const Recipe = require('../models/Recipe');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Public routes
router
  .route('/')
  .get(
    advancedResults(Recipe, [
      { path: 'user', select: 'name avatar' },
      { path: 'ratings.user', select: 'name avatar' }
    ]),
    getRecipes
  )
  .post(protect, authorize('user', 'chef', 'admin'), createRecipe);

router.route('/top-rated').get(getTopRatedRecipes);
router.route('/user/:userId').get(getRecipesByUser);

// Protected routes
router
  .route('/:id')
  .get(getRecipe)
  .put(protect, authorize('user', 'chef', 'admin'), updateRecipe)
  .delete(protect, authorize('user', 'chef', 'admin'), deleteRecipe);

router
  .route('/:id/photo')
  .put(protect, authorize('user', 'chef', 'admin'), recipePhotoUpload);

router
  .route('/:id/rating')
  .post(protect, authorize('user', 'chef', 'admin'), addRecipeRating);

router
  .route('/:id/favorite')
  .put(protect, authorize('user', 'chef', 'admin'), toggleFavoriteRecipe);

router
  .route('/favorites')
  .get(protect, getUserFavorites);

module.exports = router;
