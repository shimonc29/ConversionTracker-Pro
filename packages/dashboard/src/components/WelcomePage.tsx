import React, { useState } from 'react';

interface WelcomePageProps {
  onSiteCreated: (siteId: string) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onSiteCreated }) => {
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [step, setStep] = useState<'welcome' | 'create' | 'code'>('welcome');
  const [siteId, setSiteId] = useState('');

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim() || !siteUrl.trim()) return;
    
    // Generate a unique site ID
    const newSiteId = `${siteName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    setSiteId(newSiteId);
    setStep('code');
  };

  const handleGetStarted = () => {
    setStep('create');
  };

  const handleGoToDashboard = () => {
    onSiteCreated(siteId);
  };

  const generateImplementationCode = () => {
    return `<!-- Conversion Tracker Pro Implementation -->
<script>
(function() {
  // Initialize Conversion Tracker
  window.ConversionTracker = {
    siteId: '${siteId}',
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
        formAction: form.action
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
            
            <button type="submit" className="cta-button">
              Create Site & Get Code
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
          <p>Site ID: <strong>{siteId}</strong></p>
          
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
              <pre><code>ConversionTracker.trackConversion({ value: 100, currency: 'USD' });</code></pre>
            </div>
            <div className="example">
              <h4>Track a custom event:</h4>
              <pre><code>ConversionTracker.track('button_click', { buttonId: 'signup' });</code></pre>
            </div>
            <div className="example">
              <h4>Track form submissions:</h4>
              <pre><code>&lt;form data-track-conversion="true"&gt;...&lt;/form&gt;</code></pre>
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