import { apiSlice } from '../../app/api/apiSlice';

export const recipeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecipes: builder.query({
      query: (params = {}) => ({
        url: '/recipes',
        params,
      }),
      providesTags: (result = [], error, arg) =>
        result
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: 'Recipe' as const,
                _id,
              })),
              'Recipe',
            ]
          : ['Recipe'],
    }),
    getRecipe: builder.query({
      query: (id) => `/recipes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Recipe', _id: id }],
    }),
    createRecipe: builder.mutation({
      query: (recipeData) => ({
        url: '/recipes',
        method: 'POST',
        body: recipeData,
      }),
      invalidatesTags: ['Recipe'],
    }),
    updateRecipe: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/recipes/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Recipe', _id: id },
      ],
    }),
    deleteRecipe: builder.mutation({
      query: (id) => ({
        url: `/recipes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recipe'],
    }),
    addRecipeRating: builder.mutation({
      query: ({ id, rating, comment }) => ({
        url: `/recipes/${id}/rating`,
        method: 'POST',
        body: { rating, comment },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Recipe', _id: id },
      ],
    }),
    toggleFavorite: builder.mutation({
      query: (id) => ({
        url: `/recipes/${id}/favorite`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Recipe', _id: id },
        'User',
      ],
    }),
    uploadRecipeImage: builder.mutation({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return {
          url: `/recipes/${id}/photo`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Recipe', _id: id },
      ],
    }),
    getTopRatedRecipes: builder.query({
      query: () => '/recipes/top-rated',
    }),
    getUserRecipes: builder.query({
      query: (userId) => `/recipes/user/${userId}`,
    }),
    getUserFavorites: builder.query({
      query: () => '/recipes/favorites',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetRecipesQuery,
  useGetRecipeQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useAddRecipeRatingMutation,
  useToggleFavoriteMutation,
  useUploadRecipeImageMutation,
  useGetTopRatedRecipesQuery,
  useGetUserRecipesQuery,
  useGetUserFavoritesQuery,
} = recipeApiSlice;
