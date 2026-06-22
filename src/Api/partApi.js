import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './apiConfig';
import { endpoints, reducers } from './configs';
import { LOG } from '../Utils/helperFunction';

export const partApi = createApi({
  reducerPath: reducers.path.part,
  baseQuery,
  endpoints: builder => ({
    add: builder.mutation({
      query: body => {
        LOG('body-vehicle', body);
        return {
          url: endpoints.part.add.url,
          method: endpoints.part.add.method,
          ...(body instanceof FormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
          body,
        };
      },
    }),
    fetchPartByUser: builder.query({
      query: body => {
        console.log('bodybody----', body)
        return {
          url: `${endpoints.part.getPart.url}/${body}`,
          method: endpoints.part.getPart.method,
        };
      },
      transformResponse: response => response?.data,
    }),
    update: builder.mutation({
      query: ({ id, body }) => {
        LOG('update-part-body', id);
        return {
          url: `${endpoints.part.update.url}/${id}`,
          method: endpoints.part.update.method || 'PUT',
          ...(body instanceof FormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
          body,
        };
      },
      transformResponse: response => response?.data,
    }),
    delete: builder.mutation({
      query: vehicleId => {
        LOG('deleteVehicleId', vehicleId);
        return {
          url: `${endpoints.part.delete.url}/${vehicleId}`,
          method: endpoints.part.delete.method || 'DELETE',
        };
      },
      transformResponse: response => response?.data,
    }),
  }),
});

export const {
  useAddMutation,
  useFetchPartByUserQuery,
  useUpdateMutation,
  useDeleteMutation,
} = partApi;
