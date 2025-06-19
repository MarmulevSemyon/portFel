import React, { FC, useState, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Sector, ReferenceLine } from 'recharts';
import { Select, MenuItem, FormControl, InputLabel, Box, Typography, Alert, SelectChangeEvent, Paper } from '@mui/material';
import { PortfolioAsset } from '../types/portfolio';

interface PieChartData {
    name: string;
    value: number;
    fill: string;
}

interface BarChartData {
    name: string;
    pl: number;
    value: number;
    cost: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF196C', '#19D4FF', '#FFD419'];

// Изменено: Принимает string, number, null или undefined
const safeParseDecimal = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return NaN;
    // Если уже число, возвращаем его. Если строка, пытаемся парсить.
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? NaN : num;
};

type ChartType = 'allocationValue' | 'profitLossBars';

interface ChartConfig {
    label: string;
}

const chartConfigs: Record<ChartType, ChartConfig> = {
    allocationValue: {
        label: 'Allocation by Value',
    },
    profitLossBars: {
        label: 'P/L per Asset',
    },
};

const PortfolioChart: FC = () => {
    const { currentPortfolio, status, error } = useAppSelector((state) => state.portfolio);

    const [selectedChart, setSelectedChart] = useState<ChartType>('allocationValue');
    const [activeIndex, setActiveIndex] = useState(0);

    const handleChartChange = (event: SelectChangeEvent<ChartType>) => {
        setSelectedChart(event.target.value as ChartType);
    };

    const chartData = useMemo(() => {
        if (!currentPortfolio?.portfolio_assets || currentPortfolio.portfolio_assets.length === 0) {
            return { pieData: [], barData: [], hasData: false };
        }

        const pieData: PieChartData[] = [];
        const barData: BarChartData[] = [];
        let colorIndex = 0;
        let totalPortfolioValue = 0;

        currentPortfolio.portfolio_assets.forEach((pa: PortfolioAsset) => {
            if (!pa.asset) return;

            const quantity = safeParseDecimal(pa.quantity); // Теперь работает
            const currentPrice = safeParseDecimal(pa.asset.current_price); // Теперь работает
            const avgPrice = safeParseDecimal(pa.average_price); // Теперь работает

            if (isNaN(quantity)) return;

            const currentValue = isNaN(currentPrice) ? 0 : quantity * currentPrice;
            if (currentValue > 0) {
                pieData.push({
                    name: pa.asset.ticker || 'Unknown',
                    value: currentValue,
                    fill: COLORS[colorIndex % COLORS.length],
                });
                totalPortfolioValue += currentValue;
                colorIndex++;
            }

            const costBasis = (isNaN(avgPrice) || isNaN(quantity)) ? NaN : quantity * avgPrice;
            const profitLoss = (isNaN(currentValue) || isNaN(costBasis) || currentValue === 0) ? NaN : currentValue - costBasis;

            barData.push({
                name: pa.asset.ticker || 'Unknown',
                pl: isNaN(profitLoss) ? 0 : profitLoss,
                value: isNaN(currentValue) ? 0 : currentValue,
                cost: isNaN(costBasis) ? 0 : costBasis,
            });
        });

        barData.sort((a, b) => a.pl - b.pl);

        return { pieData, barData, hasData: pieData.length > 0 || barData.length > 0 };

    }, [currentPortfolio]);


    const renderActiveShape = (props: any) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontWeight="bold">
                    {payload.name}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`$${value.toFixed(2)}`}</text>
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
            </g>
        );
    };

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const barTooltipFormatter = (value: number, name: string, props: any) => {
        if (name === 'pl') {
            const sign = value >= 0 ? '+' : '';
            const color = value >= 0 ? 'green' : 'red';
            return [<span style={{ color }}>{`${sign}$${value.toFixed(2)}`}</span>, 'P/L'];
        }
        return [value, name];
    };

    const barTooltipLabelFormatter = (label: string, payload: any) => {
        if (payload && payload.length > 0) {
            const data = payload[0].payload;
            return (
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</div>
                    <div>Value: ${data.value.toFixed(2)}</div>
                    <div>Cost: ${data.cost.toFixed(2)}</div>
                </div>
            );
        }
        return label;
    };


    if (status === 'failed' && error) {
        return <Alert severity="error">Error loading portfolio details: {error}</Alert>;
    }
    if (status !== 'loading' && !currentPortfolio) {
        return <Typography>Portfolio data not available.</Typography>;
    }
    if (status !== 'loading' && !chartData.hasData) {
        return <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>Add assets to see the chart.</Typography>;
    }
    if (status === 'loading') {
        return <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>Loading chart data...</Typography>;
    }

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Portfolio Composition</Typography>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="chart-type-select-label">Chart Type</InputLabel>
                    <Select
                        labelId="chart-type-select-label"
                        value={selectedChart}
                        label="Chart Type"
                        onChange={handleChartChange}
                    >
                        {Object.entries(chartConfigs).map(([key, config]) => (
                            <MenuItem key={key} value={key}>{config.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {selectedChart === 'allocationValue' ? (
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={chartData.pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                paddingAngle={1}
                            >
                                {chartData.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number, name: string, props: any) => [`$${value.toFixed(2)}`, props.payload?.name]}/>
                        </PieChart>
                    ) : (
                        <BarChart
                            data={chartData.barData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                            <XAxis type="number" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} interval={0}/>
                            <Tooltip
                                formatter={barTooltipFormatter}
                                labelFormatter={barTooltipLabelFormatter}
                                contentStyle={{ borderRadius: '4px', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px' }}
                                cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}
                            />
                            <ReferenceLine x={0} stroke="#666" />
                            <Bar dataKey="pl" name="P/L" radius={[0, 4, 4, 0]} >
                                {chartData.barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? '#2e7d32' : '#d32f2f'} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default PortfolioChart;