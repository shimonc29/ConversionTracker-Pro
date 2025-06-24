import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>ConversionTracker Pro Dashboard</h1>
        <div className="site-info">Site: [siteId]</div>
      </header>
      <div className="dashboard-grid">
        {/* Filters, charts, and tables will be added here */}
        <div className="metrics-cards">Metrics will be shown here.</div>
        <div className="chart-section">Charts will be shown here.</div>
        <div className="attribution-section">Attribution comparison will be shown here.</div>
        <div className="detailed-table">Conversions table will be shown here.</div>
      </div>
    </div>
  );
}; 