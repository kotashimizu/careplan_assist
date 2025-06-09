import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useAuth, 
  useEncryption, 
  useAuditLog,
  EncryptedField,
  ConsentBanner,
  useTenantConfig
} from '@your-org/secure-toolkit';

function Checkout({ cart }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { encrypt } = useEncryption();
  const { logAction } = useAuditLog();
  const { isFeatureEnabled } = useTenantConfig();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // デモ用のカート
  const demoCart = cart || {
    items: [
      { id: 1, name: 'セキュアウォレット', price: 3980, quantity: 1 },
      { id: 2, name: '暗号化USBドライブ', price: 7980, quantity: 2 }
    ],
    total: 19940
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 請求情報を暗号化
      const encryptedBilling = await encrypt(JSON.stringify(billingInfo));
      
      // 注文データ
      const orderData = {
        items: demoCart.items,
        total: demoCart.total,
        paymentMethod,
        billing: encryptedBilling,
        userId: user?.id,
        timestamp: new Date().toISOString()
      };

      // 注文処理（デモ）
      console.log('注文処理中:', orderData);
      
      // 監査ログに記録
      await logAction({
        action: 'PURCHASE_COMPLETE',
        target: 'order-' + Date.now(),
        details: {
          itemCount: demoCart.items.length,
          total: demoCart.total,
          paymentMethod,
          currency: 'JPY'
        },
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      // 成功画面へ
      alert('ご注文ありがとうございました！');
      navigate('/account/orders');
      
    } catch (error) {
      console.error('注文処理エラー:', error);
      alert('注文処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">チェックアウト</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 注文内容 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">注文内容</h2>
            <div className="space-y-3">
              {demoCart.items.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">数量: {item.quantity}</div>
                  </div>
                  <div className="font-medium">
                    ¥{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 配送先情報 */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">配送先情報</h2>
            
            {!isAuthenticated && (
              <div className="mb-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  アカウントを作成すると、次回から情報入力を省略できます。
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お名前
                </label>
                <input
                  type="text"
                  required
                  value={billingInfo.name}
                  onChange={(e) => setBillingInfo({...billingInfo, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  required
                  value={billingInfo.email}
                  onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所
                </label>
                <input
                  type="text"
                  required
                  value={billingInfo.address}
                  onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    市区町村
                  </label>
                  <input
                    type="text"
                    required
                    value={billingInfo.city}
                    onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    郵便番号
                  </label>
                  <input
                    type="text"
                    required
                    value={billingInfo.postalCode}
                    onChange={(e) => setBillingInfo({...billingInfo, postalCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 支払い方法 */}
            <h3 className="text-lg font-semibold mt-6 mb-4">支払い方法</h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>クレジットカード</span>
              </label>

              {isFeatureEnabled('alternativePayments') && (
                <>
                  <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span>PayPal</span>
                  </label>
                  <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="transfer"
                      checked={paymentMethod === 'transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span>銀行振込</span>
                  </label>
                </>
              )}
            </div>

            {paymentMethod === 'card' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 mb-3">
                  カード情報は暗号化されて安全に処理されます
                </p>
                <EncryptedField
                  type="creditcard"
                  placeholder="カード番号"
                  className="mb-3"
                />
                <div className="grid grid-cols-2 gap-3">
                  <EncryptedField
                    type="text"
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                  <EncryptedField
                    type="text"
                    placeholder="CVV"
                    maxLength="4"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '処理中...' : '注文を確定する'}
            </button>
          </form>
        </div>

        {/* 注文サマリー */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">注文内容</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>小計</span>
                <span>¥{demoCart.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>送料</span>
                <span>無料</span>
              </div>
              <div className="flex justify-between">
                <span>消費税</span>
                <span>込み</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>合計</span>
                <span>¥{demoCart.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-md">
              <div className="flex items-center text-green-800">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">SSL暗号化通信</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                お客様の情報は安全に保護されています
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* プライバシー同意 */}
      <ConsentBanner />
    </div>
  );
}

export default Checkout;