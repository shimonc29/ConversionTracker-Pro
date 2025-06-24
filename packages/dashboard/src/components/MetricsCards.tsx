import React from 'react';

interface MetricsCardsProps {
  metrics: {
    totalConversions: number;
    totalValue: number;
    conversionRate: number;
    topSources: { source: string; value: number }[];
  } | null;
  loading?: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, loading }) => {
  if (loading) return <div>Loading metrics...</div>;
  if (!metrics) return <div>No data</div>;
  return (
    <div className="metrics-cards">
      <div className="metric-card">
        <div className="metric-title">Total Conversions</div>
        <div className="metric-value">{metrics.totalConversions}</div>
      </div>
      <div className="metric-card">
        <div className="metric-title">Total Value</div>
        <div className="metric-value">{metrics.totalValue}</div>
      </div>
      <div className="metric-card">
        <div className="metric-title">Conversion Rate</div>
        <div className="metric-value">{metrics.conversionRate}%</div>
      </div>
      <div className="metric-card">
        <div className="metric-title">Top Sources</div>
        <ul>
          {metrics.topSources.map((s, i) => (
            <li key={i}>{s.source}: {s.value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 