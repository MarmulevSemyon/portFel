import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ChartProps {
    data: {
        labels: string[];
        values: number[];
    };
}

const PerformanceChart = ({ data }: ChartProps) => {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Portfolio Value',
                data: data.values,
                borderColor: '#2e7d32',
                tension: 0.4,
            },
        ],
    };

    return (
        <Line
            data={chartData}
            options={{
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            }}
        />
    );
};

export default PerformanceChart;