import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SecureProvider, SetupWizard } from '@your-org/secure-toolkit';
import Home from './pages/Home';
import Play from './pages/Play';
import Settings from './pages/Settings';
import { gameConfig } from './config';

function App() {
  const [isSetupComplete, setIsSetupComplete] = React.useState(() => {
    return localStorage.getItem('game-setup-complete') === 'true';
  });

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">
            🎮 ゲーム初期設定
          </h1>
          <SetupWizard
            appType="game"
            theme="dark"
            onComplete={(config) => {
              console.log('ゲーム設定完了:', config);
              localStorage.setItem('game-setup-complete', 'true');
              localStorage.setItem('game-config', JSON.stringify(config));
              setIsSetupComplete(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <SecureProvider config={gameConfig}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Play />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </SecureProvider>
  );
}

export default App;