import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { PortfolioAsset } from '../../types/portfolio';

interface AssetTableProps {
    assets: PortfolioAsset[];
}

const safeParseDecimal = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return NaN;
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? NaN : num;
};

const formatCurrency = (value: number | null | undefined, defaultValue: string = 'N/A'): string => {
    if (value === null || value === undefined || isNaN(value)) {
        return defaultValue;
    }
    return `$${value.toFixed(2)}`;
};


const AssetTable = ({ assets }: AssetTableProps) => {
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Ticker</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Avg Price</TableCell>
                        <TableCell align="right">Current Price</TableCell>
                        <TableCell align="right">Total Value</TableCell>
                        <TableCell align="right">P/L ($)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {assets.map((pa) => {
                        const quantityNum = safeParseDecimal(pa.quantity);
                        const avgPriceNum = safeParseDecimal(pa.average_price);
                        const currentPriceNum = safeParseDecimal(pa.asset?.current_price);
                        const totalValueNum = safeParseDecimal(pa.total_value);

                        const calculatedCurrentValue = (!isNaN(quantityNum) && !isNaN(currentPriceNum))
                            ? quantityNum * currentPriceNum
                            : NaN;

                        const profitLoss = (!isNaN(calculatedCurrentValue) && !isNaN(quantityNum) && !isNaN(avgPriceNum))
                            ? calculatedCurrentValue - (quantityNum * avgPriceNum)
                            : NaN;

                        const plColor = isNaN(profitLoss) ? 'text.primary' : profitLoss >= 0 ? 'success.main' : 'error.main';

                        return (
                            <TableRow hover key={pa.ID}>
                                <TableCell>{pa.asset?.ticker ?? 'N/A'}</TableCell>
                                <TableCell>{pa.asset?.company ?? 'N/A'}</TableCell>
                                <TableCell align="right">{isNaN(quantityNum) ? 'N/A' : quantityNum.toLocaleString(undefined, { maximumFractionDigits: 4 })}</TableCell>
                                <TableCell align="right">{formatCurrency(avgPriceNum)}</TableCell>
                                <TableCell align="right">{formatCurrency(currentPriceNum)}</TableCell>
                                <TableCell align="right">{formatCurrency(calculatedCurrentValue)}</TableCell>
                                <TableCell align="right" sx={{ color: plColor }}>
                                    {formatCurrency(profitLoss)}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default AssetTable;