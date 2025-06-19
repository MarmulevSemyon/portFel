import axios from 'axios';
import {API_URL} from "../config"

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для JWT
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `JWT ${token}`;
    }
    return config;
});

export {};