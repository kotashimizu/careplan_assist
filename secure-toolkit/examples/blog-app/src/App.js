import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SecureProvider, SetupWizard } from '@your-org/secure-toolkit';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { blogConfig } from './config';

function App() {
  const [isSetupComplete, setIsSetupComplete] = React.useState(() => {
    return localStorage.getItem('blog-setup-complete') === 'true';
  });

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8">
            📝 ブログシステム初期設定
          </h1>
          <SetupWizard
            appType="blog"
            onComplete={(config) => {
              console.log('ブログ設定完了:', config);
              localStorage.setItem('blog-setup-complete', 'true');
              localStorage.setItem('blog-config', JSON.stringify(config));
              setIsSetupComplete(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <SecureProvider config={blogConfig}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SecureProvider>
  );
}

export default App;