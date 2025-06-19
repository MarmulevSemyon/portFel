import { apiClient } from './index';
import { Deal } from '../types/portfolio';

export const dealsApi = {
    getPortfolioDeals: async (portfolioId: number): Promise<Deal[]> => {
        const response = await apiClient.get(`/portfolios/${portfolioId}/deals/`);
        return response.data;
    },

    createDeal: async (portfolioId: number, dealData: Omit<Deal, 'Deal_ID'>) => {
        const response = await apiClient.post(
            `/portfolios/${portfolioId}/deals/`,
            dealData
        );
        return response.data;
    },

    deleteDeal: async (dealId: number) => {
        await apiClient.delete(`/deals/${dealId}/`);
    },
};

export {};