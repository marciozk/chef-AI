const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an ingredient name'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
  },
  unit: {
    type: String,
    required: [true, 'Please add a unit of measurement'],
    enum: [
      'g', 'kg', 'mg', 'l', 'ml', 'tsp', 'tbsp', 'cup', 'pint', 'quart', 'gallon',
      'oz', 'lb', 'pinch', 'dash', 'drop', 'piece', 'sprig', 'bunch', 'clove',
      'head', 'slice', 'can', 'package', 'to taste'
    ]
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  group: {
    type: String,
    default: 'main'
  }
});

const InstructionStepSchema = new mongoose.Schema({
  step: {
    type: String,
    required: [true, 'Please add a step description'],
    maxlength: [500, 'Step cannot be more than 500 characters']
  },
  order: {
    type: Number,
    required: true
  },
  timer: {
    duration: Number,
    unit: {
      type: String,
      enum: ['seconds', 'minutes', 'hours']
    }
  },
  tips: [String]
});

const NutritionInfoSchema = new mongoose.Schema({
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  fiber: Number,
  sugar: Number,
  sodium: Number,
  cholesterol: Number
});

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a recipe title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    ingredients: [IngredientSchema],
    instructions: [InstructionStepSchema],
    prepTime: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours'],
        default: 'minutes'
      }
    },
    cookTime: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours'],
        default: 'minutes'
      }
    },
    servings: {
      type: Number,
      default: 4
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium'
    },
    cuisine: {
      type: String,
      required: [true, 'Please add a cuisine type']
    },
    dietaryRestrictions: [{
      type: String,
      enum: [
        'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free',
        'soy-free', 'egg-free', 'halal', 'kosher', 'keto', 'paleo'
      ]
    }],
    nutrition: NutritionInfoSchema,
    images: [{
      url: String,
      isPrimary: {
        type: Boolean,
        default: false
      },
      caption: String
    }],
    videoUrl: String,
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    ratings: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    views: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      enum: ['original', 'imported', 'shared'],
      default: 'original'
    },
    sourceUrl: String,
    sourceNotes: String,
    equipment: [String],
    tips: [{
      type: String,
      maxlength: [200, 'Tip cannot be more than 200 characters']
    }],
    variations: [{
      description: String,
      ingredients: [{
        name: String,
        quantity: Number,
        unit: String,
        notes: String
      }]
    }],
    relatedRecipes: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Recipe'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    lastCooked: Date,
    favoriteCount: {
      type: Number,
      default: 0
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Calculate average rating
RecipeSchema.statics.getAverageRating = async function(recipeId) {
  const obj = await this.aggregate([
    {
      $match: { _id: recipeId }
    },
    {
      $unwind: '$ratings'
    },
    {
      $group: {
        _id: '$_id',
        averageRating: { $avg: '$ratings.rating' }
      }
    }
  ]);

  try {
    await this.model('Recipe').findByIdAndUpdate(recipeId, {
      averageRating: obj[0] ? Math.ceil(obj[0].averageRating * 2) / 2 : 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
RecipeSchema.post('save', function() {
  this.constructor.getAverageRating(this._id);
});

// Call getAverageRating before remove
RecipeSchema.pre('remove', function() {
  this.constructor.getAverageRating(this._id);
});

// Create text index for search
RecipeSchema.index({
  title: 'text',
  description: 'text',
  'ingredients.name': 'text',
  tags: 'text',
  cuisine: 'text'
});

// Update the updatedAt field before saving
RecipeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Recipe', RecipeSchema);
