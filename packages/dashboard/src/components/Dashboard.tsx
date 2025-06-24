import React, { useState, useEffect } from 'react';
import { MetricsCards } from './MetricsCards';

const mockMetrics = {
  totalConversions: 123,
  totalValue: 4567,
  conversionRate: 3.2,
  topSources: [
    { source: 'Google', value: 2000 },
    { source: 'Facebook', value: 1500 },
    { source: 'Direct', value: 800 },
  ],
};

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<typeof mockMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>ConversionTracker Pro Dashboard</h1>
        <div className="site-info">Site: [siteId]</div>
      </header>
      <div className="dashboard-grid">
        <MetricsCards metrics={metrics} loading={loading} />
        <div className="chart-section">Charts will be shown here.</div>
        <div className="attribution-section">Attribution comparison will be shown here.</div>
        <div className="detailed-table">Conversions table will be shown here.</div>
      </div>
    </div>
  );
}; 