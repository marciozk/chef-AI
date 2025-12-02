const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Recipe = require('../models/Recipe');
const path = require('path');

// @desc    Get all recipes
// @route   GET /api/v1/recipes
// @access  Public
exports.getRecipes = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single recipe
// @route   GET /api/v1/recipes/:id
// @access  Public
exports.getRecipe = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'name avatar'
    })
    .populate({
      path: 'ratings.user',
      select: 'name avatar'
    });

  if (!recipe) {
    return next(
      new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
    );
  }

  // Increment view count
  recipe.views += 1;
  await recipe.save();

  res.status(200).json({
    success: true,
    data: recipe
  });
});

// @desc    Create new recipe
// @route   POST /api/v1/recipes
// @access  Private
exports.createRecipe = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const recipe = await Recipe.create(req.body);

  res.status(201).json({
    success: true,
    data: recipe
  });
});

// @desc    Update recipe
// @route   PUT /api/v1/recipes/:id
// @access  Private
exports.updateRecipe = asyncHandler(async (req, res, next) => {
  let recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(
      new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is recipe owner or admin
  if (recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this recipe`,
        401
      )
    );
  }

  // Update the recipe
  recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: recipe
  });
});

// @desc    Delete recipe
// @route   DELETE /api/v1/recipes/:id
// @access  Private
exports.deleteRecipe = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(
      new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is recipe owner or admin
  if (recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this recipe`,
        401
      )
    );
  }

  await recipe.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload photo for recipe
// @route   PUT /api/v1/recipes/:id/photo
// @access  Private
exports.recipePhotoUpload = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(
      new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is recipe owner or admin
  if (recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this recipe`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${recipe._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Update recipe with new photo
    await Recipe.findByIdAndUpdate(req.params.id, {
      photo: file.name
    });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

// @desc    Add rating to recipe
// @route   POST /api/v1/recipes/:id/rating
// @access  Private
exports.addRecipeRating = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const userId = req.user.id;

  // Find the recipe
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(
      new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user already rated
  const existingRating = recipe.ratings.find(
    (r) => r.user.toString() === userId
  );

  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    if (comment) existingRating.comment = comment;
  } else {
    // Add new rating
    recipe.ratings.push({
      user: userId,
      rating,
      comment: comment || ''
    });
  }

  await recipe.save();

  res.status(200).json({
    success: true,
    data: recipe
  });
});

// @desc    Toggle favorite recipe
// @route   PUT /api/v1/recipes/:id/favorite
// @access  Private
exports.toggleFavoriteRecipe = asyncHandler(async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(
      new ErrorResponse(`Recipe not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if the recipe is already favorited by the user
  const userIndex = recipe.favoritedBy.indexOf(req.user.id);
  let isFavorited = false;

  if (userIndex === -1) {
    // Not favorited, add to favorites
    recipe.favoritedBy.push(req.user.id);
    isFavorited = true;
  } else {
    // Already favorited, remove from favorites
    recipe.favoritedBy.splice(userIndex, 1);
  }

  // Update favorite count
  recipe.favoriteCount = recipe.favoritedBy.length;
  await recipe.save();

  res.status(200).json({
    success: true,
    data: {
      isFavorited,
      favoriteCount: recipe.favoriteCount
    }
  });
});

// @desc    Get top rated recipes
// @route   GET /api/v1/recipes/top-rated
// @access  Public
exports.getTopRatedRecipes = asyncHandler(async (req, res, next) => {
  const recipes = await Recipe.find({ averageRating: { $gte: 4 } })
    .sort({ averageRating: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    count: recipes.length,
    data: recipes
  });
});

// @desc    Get recipes by user
// @route   GET /api/v1/recipes/user/:userId
// @access  Public
exports.getRecipesByUser = asyncHandler(async (req, res, next) => {
  const recipes = await Recipe.find({ user: req.params.userId });

  res.status(200).json({
    success: true,
    count: recipes.length,
    data: recipes
  });
});

// @desc    Get user's favorite recipes
// @route   GET /api/v1/recipes/favorites
// @access  Private
exports.getUserFavorites = asyncHandler(async (req, res, next) => {
  const recipes = await Recipe.find({ favoritedBy: req.user.id });

  res.status(200).json({
    success: true,
    count: recipes.length,
    data: recipes
  });
});
