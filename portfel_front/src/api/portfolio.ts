import { apiClient } from './index';
import { Portfolio, PortfolioAsset } from '../types/portfolio';

export const portfolioApi = {
    getPortfolios: async (): Promise<Portfolio[]> => {
        const response = await apiClient.get('/portfolios/');
        return response.data;
    },

    createPortfolio: async (name: string): Promise<Portfolio> => {
        const response = await apiClient.post('/portfolios/', { name });
        return response.data;
    },

    getPortfolioAssets: async (portfolioId: number): Promise<PortfolioAsset[]> => {
        const response = await apiClient.get(`/portfolios/${portfolioId}/assets/`);
        return response.data;
    },

    deletePortfolio: async (portfolioId: number) => {
        await apiClient.delete(`/portfolios/${portfolioId}/`);
    },

    updatePortfolio: async (portfolio: Portfolio): Promise<Portfolio> => {
        const response = await apiClient.put(
            `/portfolios/${portfolio.Port_ID}/`,
            portfolio
        );
        return response.data;
    },

    deletePortfolioAsset: async (portfolioAssetId: number): Promise<void> => {
        await apiClient.delete(`/portfolio-assets/${portfolioAssetId}/`);
    },
};

export {};