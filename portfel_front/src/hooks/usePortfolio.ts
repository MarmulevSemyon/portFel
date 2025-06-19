import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPortfolios } from '../store/slices/portfolioSlice';

const usePortfolio = (portfolioId?: number) => {
    const dispatch = useAppDispatch();
    const { portfolios, currentPortfolio, status, error } = useAppSelector(
        (state) => state.portfolio
    );

    useEffect(() => {
        if (portfolios.length === 0 && status === 'idle') {
            dispatch(fetchPortfolios());
        }
    }, [dispatch, status]);

    const getPortfolioById = (id: number) =>
        portfolios.find((p) => p.Port_ID === id);

    return {
        portfolios,
        currentPortfolio: portfolioId ? getPortfolioById(portfolioId) : null,
        loading: status === 'loading',
        error
    };
};

export default usePortfolio;