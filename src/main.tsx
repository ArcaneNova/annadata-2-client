
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a loading indicator
const showLoadingIndicator = () => {
  const loadingEl = document.createElement('div');
  loadingEl.id = 'initial-loading';
  loadingEl.innerHTML = `
    <style>
      #initial-loading {
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: white;
        z-index: 9999;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #138808;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
    <div class="spinner"></div>
    <p>Loading application...</p>
  `;
  document.body.appendChild(loadingEl);
};

const removeLoadingIndicator = () => {
  const loadingEl = document.getElementById('initial-loading');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    loadingEl.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      loadingEl.remove();
    }, 500);
  }
};

// Show loading indicator
showLoadingIndicator();

// Pre-load critical resources
const preloadResources = async () => {
  // Add any critical resources that need to be preloaded here
  const preloadImages = [
    'https://images.unsplash.com/photo-1517022812141-23620dba5c23',
    'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8'
  ];
  
  await Promise.all(
    preloadImages.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // Don't block if image fails
        img.src = url;
      });
    })
  );
};

// Mount app with performance measuring
const mountApp = async () => {
  try {
    // Preload resources in parallel with app initialization
    const preloadPromise = preloadResources();
    
    // Create root and render with minimal initial content
    const root = createRoot(document.getElementById("root")!);
    root.render(<App />);
    
    // Ensure preloading completes
    await preloadPromise;
    
    // Remove loading indicator after everything is loaded
    window.addEventListener('load', () => {
      setTimeout(removeLoadingIndicator, 500); // Small delay to ensure rendering is complete
    });
    
    // If load event already fired, remove loading manually
    if (document.readyState === 'complete') {
      setTimeout(removeLoadingIndicator, 500);
    }
    
  } catch (error) {
    console.error('Error mounting app:', error);
    removeLoadingIndicator();
  }
};

// Start mounting the app
mountApp();

// Add performance monitoring
const reportWebVitals = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    // Record core web vitals
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      // Log key metrics
      console.log(`Time to Interactive: ${navEntry.domInteractive}ms`);
      console.log(`DOM Content Loaded: ${navEntry.domContentLoadedEventEnd}ms`);
      console.log(`Load Complete: ${navEntry.loadEventEnd}ms`);
    }
  }
};

// Report web vitals after the app loads
window.addEventListener('load', reportWebVitals);
