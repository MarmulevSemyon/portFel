import { apiClient } from './index';
import { Asset } from '../types/portfolio';

export const assetsApi = {
    getAllAssets: async (): Promise<Asset[]> => {
        const response = await apiClient.get('/assets/');
        return response.data;
    },

    getAssetDetails: async (assetId: number): Promise<Asset> => {
        try {
            const response = await apiClient.get(`/assets/${assetId}/`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Asset not found');
            }
            throw new Error('Failed to fetch asset details');
        }
    },

    searchAssets: async (query: string): Promise<Asset[]> => {
        const response = await apiClient.get('/assets/', { params: { search: query } });
        return response.data;
    },
};

export {};