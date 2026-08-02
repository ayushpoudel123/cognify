import { apiClient } from '@/shared/lib/axios';

export const authApi = {
  login: async (data: any) => {
    return apiClient.post('/auth/login', data);
  },
  register: async (data: any) => {
    return apiClient.post('/auth/register', data);
  },
};
