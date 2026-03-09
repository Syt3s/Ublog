import apiClient from './api';

export interface User {
  userID: string;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  postCount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  postID: string;
  userID: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expireAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
}

export interface CreateUserResponse {
  userID: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', data);
    return response.data;
  },

  register: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await apiClient.post<CreateUserResponse>('/v1/users', data);
    return response.data;
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.put<LoginResponse>('/refresh-token', {});
    return response.data;
  },
};

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>(`/v1/users/me`);
    return response.data.user;
  },

  getUser: async (userID: string): Promise<User> => {
    const response = await apiClient.get<{ user: User }>(`/v1/users/${userID}`);
    return response.data.user;
  },

  listUsers: async (offset?: number, limit?: number): Promise<{ users: User[]; totalCount: string }> => {
    const params: any = {};
    if (offset !== undefined) params.offset = offset;
    if (limit !== undefined) params.limit = limit;
    
    const response = await apiClient.get<any>('/v1/users', { params });
    return {
      users: response.data.users || [],
      totalCount: response.data.totalCount || '0',
    };
  },

  updateUser: async (userID: string, data: Partial<User>): Promise<void> => {
    await apiClient.put(`/v1/users/${userID}`, data);
  },

  deleteUser: async (userID: string): Promise<void> => {
    await apiClient.delete(`/v1/users/${userID}`);
  },

  changePassword: async (userID: string, oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put(`/v1/users/${userID}/change-password`, {
      oldPassword,
      newPassword,
    });
  },
};

export const postService = {
  createPost: async (data: { title: string; content: string }): Promise<{ postID: string }> => {
    const response = await apiClient.post<{ postID: string }>('/v1/posts', data);
    return response.data;
  },

  getPost: async (postID: string): Promise<Post> => {
    const response = await apiClient.get<{ post: Post }>(`/v1/posts/${postID}`);
    return response.data.post;
  },

  listPosts: async (offset?: number, limit?: number, title?: string): Promise<{ posts: Post[]; totalCount: string }> => {
    const params: any = {};
    if (offset !== undefined) params.offset = offset;
    if (limit !== undefined) params.limit = limit;
    if (title !== undefined) params.title = title;
    
    const response = await apiClient.get<any>('/v1/posts', { params });
    return {
      posts: response.data.posts || [],
      totalCount: response.data.totalCount || '0',
    };
  },

  updatePost: async (postID: string, data: { title: string; content: string }): Promise<void> => {
    await apiClient.put(`/v1/posts/${postID}`, data);
  },

  deletePosts: async (postIDs: string[]): Promise<void> => {
    await apiClient.delete('/v1/posts', { data: { postIDs } });
  },
};
