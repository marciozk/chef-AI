import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface FavoriteRecipe {
  _id: string;
  title: string;
  image?: string;
  rating: number;
  reviews: number;
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
  tags: string[];
  favoritedAt: string;
}

interface GetFavoritesResponse {
  data: FavoriteRecipe[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface GetFavoritesParams {
  page: number;
  limit: number;
  search?: string;
}

export const favoritesApiSlice = createApi({
  reducerPath: 'favoritesApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/favorites',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Favorite'],
  endpoints: (builder) => ({
    getFavoriteRecipes: builder.query<GetFavoritesResponse, GetFavoritesParams>({
      query: ({ page = 1, limit = 12, search = '' }) => ({
        url: '/',
        params: { page, limit, search },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Favorite' as const, id: _id })),
              { type: 'Favorite', id: 'LIST' },
            ]
          : [{ type: 'Favorite', id: 'LIST' }],
    }),
    addToFavorites: builder.mutation<{ message: string }, string>({
      query: (recipeId) => ({
        url: `/${recipeId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),
    removeFromFavorites: builder.mutation<{ message: string }, string>({
      query: (recipeId) => ({
        url: `/${recipeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, recipeId) => [
        { type: 'Favorite', id: recipeId },
        { type: 'Favorite', id: 'LIST' },
      ],
    }),
    isRecipeFavorite: builder.query<{ isFavorite: boolean }, string>({
      query: (recipeId) => `/${recipeId}/status`,
      providesTags: (result, error, recipeId) => [{ type: 'Favorite', id: recipeId }],
    }),
  }),
});

export const {
  useGetFavoriteRecipesQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useIsRecipeFavoriteQuery,
} = favoritesApiSlice;

export default favoritesApiSlice;
