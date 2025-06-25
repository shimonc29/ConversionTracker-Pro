import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { MetricsCards } from './MetricsCards';
import { ConversionsChart } from './ConversionsChart';
import { ConversionsTable } from './ConversionsTable';
import { FilterPanel } from './FilterPanel';
import { siteService, Site } from '../services/siteService';

const API_BASE_URL = 'https://us-central1-conversiontrackerpro.cloudfunctions.net/api';
const COLLECT_URL = `${API_BASE_URL}/collect`;
const GET_CONVERSIONS_URL = `${API_BASE_URL}/conversions`;
const GET_ANALYTICS_URL = `${API_BASE_URL}/analytics`;

interface DashboardProps {
  user: User;
}

// Site List Component
const SiteList: React.FC<{ sites: Site[], onSiteSelect: (site: Site) => void, onNewSite: () => void }> = ({ sites, onSiteSelect, onNewSite }) => {
  return (
    <div className="site-list">
      <h2>האתרים שלך</h2>
      {sites.length === 0 ? (
        <div className="no-sites">
          <p>אין לך אתרים עדיין</p>
          <button onClick={onNewSite} className="cta-button">צור אתר ראשון</button>
        </div>
      ) : (
        <div className="sites-grid">
          {sites.map(site => (
            <div key={site.id} className="site-card" onClick={() => onSiteSelect(site)}>
              <h3>{site.name}</h3>
              <p>{site.url}</p>
              <small>Site ID: {site.siteId}</small>
            </div>
          ))}
          <div className="site-card new-site" onClick={onNewSite}>
            <h3>+ אתר חדש</h3>
            <p>צור אתר חדש למעקב</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Welcome Page Component
const WelcomePage: React.FC<{ onSiteCreated: (site: Site) => void, user: User }> = ({ onSiteCreated, user }) => {
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [step, setStep] = useState<'welcome' | 'create' | 'code'>('welcome');
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim() || !siteUrl.trim()) return;
    
    setLoading(true);
    try {
      const newSite = await siteService.createSite(user.uid, siteName, siteUrl);
      setSite(newSite);
      setStep('code');
    } catch (error) {
      console.error('Error creating site:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    setStep('create');
  };

  const handleGoToDashboard = () => {
    if (site) {
      onSiteCreated(site);
    }
  };

  const generateImplementationCode = () => {
    if (!site) return '';
    
    return `<!-- Conversion Tracker Pro Implementation -->
<script>
(function() {
  // Initialize Conversion Tracker
  window.ConversionTracker = {
    siteId: '${site.siteId}',
    apiUrl: 'https://us-central1-conversiontrackerpro.cloudfunctions.net/api',
    
    // Track page view
    trackPageView: function(pageData = {}) {
      this.track('page_view', pageData);
    },
    
    // Track conversion
    trackConversion: function(conversionData = {}) {
      this.track('conversion', conversionData);
    },
    
    // Track custom event
    track: function(eventType, eventData = {}) {
      const event = {
        eventId: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        siteId: this.siteId,
        type: eventType,
        data: {
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          screen: {
            width: screen.width,
            height: screen.height
          },
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...eventData
        },
        clientTimestamp: new Date().toISOString()
      };
      
      fetch(this.apiUrl + '/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [event] })
      }).catch(console.error);
    }
  };
  
  // Auto-track page views
  ConversionTracker.trackPageView();
  
  // Track conversions on form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.dataset.trackConversion) {
      ConversionTracker.trackConversion({
        formId: form.id || form.className,
        formAction: form.action,
        value: parseFloat(form.dataset.value) || 0,
        currency: form.dataset.currency || 'USD'
      });
    }
  });
  
  // Track clicks on buttons with data-track attribute
  document.addEventListener('click', function(e) {
    const element = e.target;
    if (element.dataset.track) {
      ConversionTracker.track(element.dataset.track, {
        elementId: element.id,
        elementText: element.textContent,
        elementType: element.type
      });
    }
  });
})();
</script>`;
  };

  if (step === 'welcome') {
    return (
      <div className="welcome-page">
        <div className="welcome-content">
          <h1>🎯 Conversion Tracker Pro</h1>
          <p className="welcome-subtitle">
            Track conversions, analyze user behavior, and optimize your website performance
          </p>
          
          <div className="features">
            <div className="feature">
              <h3>📊 Real-time Analytics</h3>
              <p>Monitor conversions and user interactions in real-time</p>
            </div>
            <div className="feature">
              <h3>🚀 Easy Implementation</h3>
              <p>Simple JavaScript snippet to add to your website</p>
            </div>
            <div className="feature">
              <h3>📈 Detailed Reports</h3>
              <p>Comprehensive dashboards and conversion insights</p>
            </div>
            <div className="feature">
              <h3>🔍 UTM Tracking</h3>
              <p>Track traffic sources and campaign performance</p>
            </div>
          </div>
          
          <button className="cta-button" onClick={handleGetStarted}>
            Get Started - It's Free!
          </button>
        </div>
      </div>
    );
  }

  if (step === 'create') {
    return (
      <div className="welcome-page">
        <div className="welcome-content">
          <h2>Create Your Site</h2>
          <p>Set up tracking for your website in just a few steps</p>
          
          <form onSubmit={handleCreateSite} className="create-site-form">
            <div className="form-group">
              <label htmlFor="siteName">Website Name</label>
              <input
                id="siteName"
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="My Awesome Website"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="siteUrl">Website URL</label>
              <input
                id="siteUrl"
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
            
            <button type="submit" className="cta-button" disabled={loading}>
              {loading ? 'יוצר אתר...' : 'Create Site & Get Code'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className="welcome-page">
        <div className="welcome-content">
          <h2>🎉 Your Site is Ready!</h2>
          <p>Site ID: <strong>{site?.siteId}</strong></p>
          
          <div className="implementation-steps">
            <h3>Implementation Steps:</h3>
            <ol>
              <li>Copy the code below</li>
              <li>Paste it in the &lt;head&gt; section of your website</li>
              <li>Start tracking conversions automatically!</li>
            </ol>
          </div>
          
          <div className="code-section">
            <h3>Implementation Code:</h3>
            <pre className="code-block">
              <code>{generateImplementationCode()}</code>
            </pre>
            <button 
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(generateImplementationCode())}
            >
              📋 Copy Code
            </button>
          </div>
          
          <div className="usage-examples">
            <h3>Usage Examples:</h3>
            <div className="example">
              <h4>Track a conversion:</h4>
              <pre><code>{`ConversionTracker.trackConversion({ value: 100, currency: 'USD' });`}</code></pre>
            </div>
            <div className="example">
              <h4>Track a custom event:</h4>
              <pre><code>{`ConversionTracker.track('button_click', { buttonId: 'signup' });`}</code></pre>
            </div>
            <div className="example">
              <h4>Track form submissions:</h4>
              <pre><code>&lt;form data-track-conversion="true" data-value="50" data-currency="USD"&gt;...&lt;/form&gt;</code></pre>
            </div>
            <div className="example">
              <h4>Track button clicks:</h4>
              <pre><code>&lt;button data-track="signup_click"&gt;Sign Up&lt;/button&gt;</code></pre>
            </div>
          </div>
          
          <button className="cta-button" onClick={handleGoToDashboard}>
            🚀 Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// Main Dashboard Component
export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [conversions, setConversions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingConversions, setLoadingConversions] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingSites, setLoadingSites] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    type: '',
  });

  // Load user's sites
  useEffect(() => {
    const loadSites = async () => {
      try {
        const userSites = await siteService.getUserSites(user.uid);
        setSites(userSites);
        if (userSites.length === 0) {
          setShowWelcome(true);
        }
      } catch (error) {
        console.error('Error loading sites:', error);
      } finally {
        setLoadingSites(false);
      }
    };

    loadSites();
  }, [user.uid]);

  // Load data for current site
  useEffect(() => {
    if (currentSite) {
      setLoadingConversions(true);
      setLoadingAnalytics(true);
      
      // Load conversions
      fetch(`${GET_CONVERSIONS_URL}?siteId=${currentSite.siteId}`)
        .then(res => res.json())
        .then(json => setConversions(json.conversions || []))
        .catch(() => setConversions([]))
        .finally(() => setLoadingConversions(false));

      // Load analytics
      fetch(`${GET_ANALYTICS_URL}?siteId=${currentSite.siteId}`)
        .then(res => res.json())
        .then(json => setAnalytics(json.analytics || {}))
        .catch(() => setAnalytics({}))
        .finally(() => setLoadingAnalytics(false));
    }
  }, [currentSite]);

  // Filter conversions by date and type
  const filteredConversions = conversions.filter((c) => {
    const inType = !filters.type || c.conversionType === filters.type;
    const inStart = !filters.dateRange.start || c.timestamp >= filters.dateRange.start;
    const inEnd = !filters.dateRange.end || c.timestamp <= filters.dateRange.end;
    return inType && inStart && inEnd;
  });

  const handleSiteSelect = (site: Site) => {
    setCurrentSite(site);
    setShowWelcome(false);
  };

  const handleNewSite = () => {
    setShowWelcome(true);
  };

  const handleSiteCreated = (site: Site) => {
    setSites(prev => [...prev, site]);
    setCurrentSite(site);
    setShowWelcome(false);
  };

  const handleBackToSites = () => {
    setCurrentSite(null);
    setShowWelcome(false);
  };

  // Show welcome page for new users or when creating new site
  if (showWelcome) {
    return <WelcomePage onSiteCreated={handleSiteCreated} user={user} />;
  }

  // Show site list if no site is selected
  if (!currentSite) {
    if (loadingSites) {
      return <div style={{textAlign: 'center', marginTop: 100}}>טוען אתרים...</div>;
    }
    
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>ConversionTracker Pro Dashboard</h1>
          <div className="user-info">שלום, {user.displayName || user.email}</div>
        </header>
        <SiteList 
          sites={sites} 
          onSiteSelect={handleSiteSelect} 
          onNewSite={handleNewSite} 
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>ConversionTracker Pro Dashboard</h1>
        <div className="site-info">
          <div>אתר: {currentSite.name}</div>
          <div>Site ID: {currentSite.siteId}</div>
        </div>
        <div className="header-actions">
          <button 
            className="back-button"
            onClick={handleBackToSites}
          >
            ← חזור לאתרים
          </button>
          <button 
            className="new-site-button"
            onClick={handleNewSite}
          >
            + אתר חדש
          </button>
        </div>
      </header>
      <div className="dashboard-grid">
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
        <MetricsCards metrics={analytics} loading={loadingAnalytics} />
        <div className="chart-section">
          <ConversionsChart />
        </div>
        <div className="detailed-table">
          <h3>Conversions Table</h3>
          {loadingConversions ? (
            <div>Loading conversions...</div>
          ) : (
            <ConversionsTable conversions={filteredConversions} />
          )}
        </div>
        
        {/* Analytics Section */}
        {!loadingAnalytics && analytics && (
          <div className="analytics-section">
            <h3>Traffic Sources & UTM Analytics</h3>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Top Traffic Sources</h4>
                {Object.keys(analytics.trafficSources || {}).length > 0 ? (
                  <ul>
                    {Object.entries(analytics.trafficSources as Record<string, number>)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([source, count]) => (
                        <li key={source}>{source}: {count}</li>
                      ))}
                  </ul>
                ) : (
                  <p>No traffic source data available</p>
                )}
              </div>
              
              <div className="analytics-card">
                <h4>UTM Sources</h4>
                {Object.keys(analytics.utmSources || {}).length > 0 ? (
                  <ul>
                    {Object.entries(analytics.utmSources as Record<string, number>)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([source, count]) => (
                        <li key={source}>{source}: {count}</li>
                      ))}
                  </ul>
                ) : (
                  <p>No UTM source data available</p>
                )}
              </div>
              
              <div className="analytics-card">
                <h4>UTM Campaigns</h4>
                {Object.keys(analytics.utmCampaigns || {}).length > 0 ? (
                  <ul>
                    {Object.entries(analytics.utmCampaigns as Record<string, number>)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([campaign, count]) => (
                        <li key={campaign}>{campaign}: {count}</li>
                      ))}
                  </ul>
                ) : (
                  <p>No UTM campaign data available</p>
                )}
              </div>
              
              <div className="analytics-card">
                <h4>Top Pages</h4>
                {Object.keys(analytics.topPages || {}).length > 0 ? (
                  <ul>
                    {Object.entries(analytics.topPages as Record<string, number>)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([page, count]) => (
                        <li key={page}>{page.split('/').pop() || page}: {count}</li>
                      ))}
                  </ul>
                ) : (
                  <p>No page data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 