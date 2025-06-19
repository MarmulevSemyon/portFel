import { Portfolio } from '../../types/portfolio';

const PerformanceWidget = ({ portfolio }: { portfolio: Portfolio }) => {
    const metrics = [
        { label: 'Total Value', value: portfolio.total_value, format: 'currency' },
    ];

    return (
        <div className="performance-widget">
            {metrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                    <div className="metric-label">{metric.label}</div>
                    <div className={`metric-value ${metric.value >= 0 ? 'positive' : 'negative'}`}>
                        {metric.format === 'currency' && '$'}
                        {metric.value.toFixed(metric.format === 'percent' ? 2 : 0)}
                        {metric.format === 'percent' && '%'}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PerformanceWidget;