import React from 'react';

interface MetricsCardsProps {
  metrics: {
    totalEvents?: number;
    totalConversions?: number;
    totalPageViews?: number;
    totalCustomEvents?: number;
    conversionValue?: number;
    trafficSources?: Record<string, number>;
    utmSources?: Record<string, number>;
    utmCampaigns?: Record<string, number>;
  } | null;
  loading?: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, loading }) => {
  if (loading) return <div className="metrics-cards"><div className="metric-card">Loading metrics...</div></div>;
  if (!metrics) return <div className="metrics-cards"><div className="metric-card">No data available</div></div>;
  
  // Calculate conversion rate
  const conversionRate = metrics.totalEvents && metrics.totalConversions 
    ? ((metrics.totalConversions / metrics.totalEvents) * 100).toFixed(1)
    : '0.0';

  // Get top traffic source
  const topTrafficSource = metrics.trafficSources 
    ? Object.entries(metrics.trafficSources)
        .sort(([,a], [,b]) => b - a)[0]
    : null;

  // Get top UTM source
  const topUTMSource = metrics.utmSources 
    ? Object.entries(metrics.utmSources)
        .sort(([,a], [,b]) => b - a)[0]
    : null;

  return (
    <div className="metrics-cards">
      <div className="metric-card">
        <div className="metric-title">📊 Total Events</div>
        <div className="metric-value">{metrics.totalEvents || 0}</div>
        <div className="metric-subtitle">All tracked events</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-title">🎯 Total Conversions</div>
        <div className="metric-value">{metrics.totalConversions || 0}</div>
        <div className="metric-subtitle">Successful conversions</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-title">📈 Conversion Rate</div>
        <div className="metric-value">{conversionRate}%</div>
        <div className="metric-subtitle">Events to conversions</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-title">💰 Total Value</div>
        <div className="metric-value">${(metrics.conversionValue || 0).toLocaleString()}</div>
        <div className="metric-subtitle">Conversion value</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-title">👁️ Page Views</div>
        <div className="metric-value">{metrics.totalPageViews || 0}</div>
        <div className="metric-subtitle">Page view events</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-title">🔧 Custom Events</div>
        <div className="metric-value">{metrics.totalCustomEvents || 0}</div>
        <div className="metric-subtitle">Custom tracked events</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-title">🌐 Top Traffic Source</div>
        <div className="metric-value">
          {topTrafficSource ? topTrafficSource[0] : 'None'}
        </div>
        <div className="metric-subtitle">
          {topTrafficSource ? `${topTrafficSource[1]} visits` : 'No data'}
        </div>
      </div>
      
      <div className="metric-card">
        <div className="metric-title">📢 Top UTM Source</div>
        <div className="metric-value">
          {topUTMSource ? topUTMSource[0] : 'None'}
        </div>
        <div className="metric-subtitle">
          {topUTMSource ? `${topUTMSource[1]} visits` : 'No data'}
        </div>
      </div>
    </div>
  );
}; 