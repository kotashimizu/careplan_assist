import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SecureProvider, SetupWizard } from '@your-org/secure-toolkit';
import Shop from './pages/Shop';
import Account from './pages/Account';
import Admin from './pages/Admin';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { ecommerceConfig } from './config';

function App() {
  const [isSetupComplete, setIsSetupComplete] = React.useState(() => {
    return localStorage.getItem('ecommerce-setup-complete') === 'true';
  });

  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8">
            🛒 ECサイト初期設定
          </h1>
          <SetupWizard
            appType="ecommerce"
            industryPreset="ecommerce"
            onComplete={(config) => {
              console.log('ECサイト設定完了:', config);
              localStorage.setItem('ecommerce-setup-complete', 'true');
              localStorage.setItem('ecommerce-config', JSON.stringify(config));
              setIsSetupComplete(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <SecureProvider config={ecommerceConfig}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account/*" element={<Account />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </SecureProvider>
  );
}

export default App;