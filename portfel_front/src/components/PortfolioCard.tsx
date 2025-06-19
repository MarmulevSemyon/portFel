import { Portfolio } from '../types/portfolio';

const PortfolioCard = ({ portfolio }: { portfolio: Portfolio }) => {
    const performanceColor = portfolio.profit_loss >= 0 ? 'green' : 'red';

    return (
        <div className="portfolio-card">
            <h3>{portfolio.name}</h3>
            <div className="portfolio-metrics">
                <div className="metric">
                    <label>Total Value</label>
                    <div className="value">
                        {portfolio.total_value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        })}
                    </div>
                </div>
                <div className="metric">
                    <label>Profit/Loss</label>
                    <div className={`value ${performanceColor}`}>
                        {portfolio.profit_loss >= 0 ? '+' : ''}
                        {portfolio.profit_loss.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        })}
                    </div>
                </div>
                <div className="metric">
                    <label>Yield</label>
                    <div className={`value ${performanceColor}`}>
                        {portfolio.yield_percent.toFixed(2)}%
                    </div>
                </div>
            </div>
            <div className="portfolio-footer">
                <span>Created: {new Date(portfolio.created_at).toLocaleDateString()}</span>
                <button>View Details</button>
            </div>
        </div>
    );
};

export default PortfolioCard;