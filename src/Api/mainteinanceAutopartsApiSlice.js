import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './apiConfig';
import { endpoints, reducers } from './configs';
import { LOG } from '../Utils/helperFunction';

export const maintenanceAutopartsApi = createApi({
  reducerPath: reducers.path.maintenanceAutoparts,
  baseQuery,
  endpoints: builder => ({
    add: builder.mutation({
      query: ({ id, body, queryParams, ...otherParams }) => {
        return {
          url: endpoints.maintenanceAutoparts.add.url,
          method: endpoints.maintenanceAutoparts.add.method,
          headers: { 'Content-Type': 'multipart/form-data' },
          body: body,
          params: queryParams,
        };
      },
    }),
    fetchMaintenanceAutopartsByUser: builder.query({
      query: id => {
        // console.log('queryParams', queryParams);
        return {
          url: `${endpoints.maintenanceAutoparts.fetchMaintenaceByUser.url}/${id}`,
          method: endpoints.maintenanceAutoparts.fetchMaintenaceByUser.method,
          // params: queryParams ? queryParams : {}
        };
      },
      transformResponse: response => response?.data,
    }),
    delete: builder.mutation({
      query: vehicleId => {
        LOG('deleteVehicleId', vehicleId);
        return {
          url: `${endpoints.maintenanceAutoparts.delete.url}/${vehicleId}`,
          method: endpoints.maintenanceAutoparts.delete.method || 'DELETE',
        };
      },
      transformResponse: response => response?.data,
    }),
  }),
});

export const { useAddMutation, useFetchMaintenanceAutopartsByUserQuery, useDeleteMutation } =
  maintenanceAutopartsApi;
