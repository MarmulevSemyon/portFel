import {apiClient} from './index';
import {User} from '../types/portfolio';
import axios from "axios";
import {API_URL} from "../config";

export const authApi = {
    login: async (credentials: { username: string; password: string }) => {
        const response = await apiClient.post('/auth/jwt/create/', credentials);
        return response.data;
    },

    register: async (userData: {
        username: string;
        email: string;
        password: string;
    }) => {
        const response = await axios.post(API_URL + '/auth/users/', userData);
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await apiClient.get('/auth/users/me/');
        return response.data;
    },

    refreshToken: async () => {
        const refresh = localStorage.getItem('refresh_token');
        const response = await apiClient.post('/auth/jwt/refresh/', {refresh});
        return response.data;
    },
};

export {};