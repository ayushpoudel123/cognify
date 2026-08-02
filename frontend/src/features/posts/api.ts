import { apiClient } from '@/shared/lib/axios';

export const postsApi = {
  getLatestFeed: async (cursor?: string) => {
    return apiClient.get('/feed/latest', { params: { cursor } });
  },
  getTrendingFeed: async () => {
    return apiClient.get('/feed/trending');
  },
  getFollowingFeed: async (cursor?: string) => {
    return apiClient.get('/feed/following', { params: { cursor } });
  },
  getPostById: async (id: string) => {
    return apiClient.get(`/posts/${id}`);
  },
  createPost: async (data: any) => {
    return apiClient.post('/posts', data);
  },
  toggleLike: async (postId: string) => {
    return apiClient.post(`/social/like/post/${postId}`);
  },
  toggleBookmark: async (postId: string) => {
    return apiClient.post(`/social/bookmark/${postId}`);
  },
};
