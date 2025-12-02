// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'chef' | 'admin';
  avatar: string;
  bio?: string;
  specialties?: string[];
  experience?: number;
  createdAt: string;
  updatedAt: string;
}

// Recipe Types
export interface Ingredient {
  _id?: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  group?: string;
}

export interface InstructionStep {
  _id?: string;
  step: string;
  order: number;
  timer?: {
    duration: number;
    unit: 'seconds' | 'minutes' | 'hours';
  };
  tips?: string[];
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
}

export interface RecipeImage {
  _id?: string;
  url: string;
  isPrimary: boolean;
  caption?: string;
}

export interface RecipeRating {
  _id?: string;
  user: string | User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  prepTime: {
    value: number;
    unit: 'minutes' | 'hours';
  };
  cookTime: {
    value: number;
    unit: 'minutes' | 'hours';
  };
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  cuisine: string;
  dietaryRestrictions?: string[];
  nutrition?: NutritionInfo;
  images: RecipeImage[];
  videoUrl?: string;
  tags: string[];
  isPublic: boolean;
  user: string | User;
  averageRating?: number;
  ratings: RecipeRating[];
  views: number;
  source: 'original' | 'imported' | 'shared';
  sourceUrl?: string;
  sourceNotes?: string;
  equipment: string[];
  tips: string[];
  variations: Array<{
    description: string;
    ingredients: Array<{
      name: string;
      quantity: number;
      unit: string;
      notes?: string;
    }>;
  }>;
  relatedRecipes: string[] | Recipe[];
  favoritedBy: string[];
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
  lastCooked?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  pagination: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
  data: T[];
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'user' | 'chef' | 'admin';
}

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  prepTime: {
    value: number;
    unit: 'minutes' | 'hours';
  };
  cookTime: {
    value: number;
    unit: 'minutes' | 'hours';
  };
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  cuisine: string;
  dietaryRestrictions: string[];
  tags: string[];
  isPublic: boolean;
}
