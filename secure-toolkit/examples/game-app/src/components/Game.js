import React, { useState, useEffect } from 'react';
import { useAuth, SecurityBadge, useAuditLog } from '@your-org/secure-toolkit';
import { useSaveManager } from '../game/SaveManager';

function Game() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const saveManager = useSaveManager();

  // ゲームステート
  const [gameState, setGameState] = useState({
    level: 1,
    score: 0,
    coins: 100,
    lives: 3,
    items: [],
    achievements: [],
    playTime: 0,
    playerName: user?.name || 'Player'
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  // ゲーム開始時にセーブデータをロード
  useEffect(() => {
    const loadSave = async () => {
      const savedGame = await saveManager.loadGame();
      if (savedGame) {
        setGameState(savedGame);
        console.log('セーブデータをロードしました');
      }
    };
    loadSave();
  }, [saveManager]);

  // オートセーブ（30秒ごと）
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(async () => {
      await saveManager.autoSave(gameState);
      console.log('オートセーブ完了');
    }, 30000);

    return () => clearInterval(interval);
  }, [isPlaying, gameState, saveManager]);

  // ゲーム開始
  const startGame = async () => {
    setIsPlaying(true);
    
    await logAction({
      action: 'GAME_START',
      details: {
        level: gameState.level,
        playerName: gameState.playerName
      }
    });
  };

  // スコア加算（チート対策付き）
  const addScore = async (points) => {
    // 不正なスコア加算をチェック
    if (points > 1000) {
      await logAction({
        action: 'SUSPICIOUS_ACTIVITY',
        severity: 'medium',
        details: {
          type: 'score_manipulation',
          attemptedScore: points
        }
      });
      return;
    }

    setGameState(prev => ({
      ...prev,
      score: prev.score + points
    }));
  };

  // コイン獲得
  const earnCoins = (amount) => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + amount
    }));
  };

  // アイテム購入
  const purchaseItem = async (itemId, price) => {
    if (gameState.coins < price) {
      alert('コインが不足しています！');
      return;
    }

    setGameState(prev => ({
      ...prev,
      coins: prev.coins - price,
      items: [...prev.items, itemId]
    }));

    await logAction({
      action: 'ITEM_PURCHASE',
      target: itemId,
      details: {
        price,
        remainingCoins: gameState.coins - price
      }
    });
  };

  // レベルアップ
  const levelUp = async () => {
    const newLevel = gameState.level + 1;
    
    setGameState(prev => ({
      ...prev,
      level: newLevel,
      lives: 3, // ライフ回復
      score: prev.score + 1000 // ボーナススコア
    }));

    await logAction({
      action: 'LEVEL_UP',
      details: {
        newLevel,
        bonusScore: 1000
      }
    });

    // 実績解除チェック
    if (newLevel === 10) {
      await unlockAchievement('first_10_levels');
    }
  };

  // 実績解除
  const unlockAchievement = async (achievementId) => {
    if (gameState.achievements.includes(achievementId)) {
      return;
    }

    setGameState(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievementId]
    }));

    await logAction({
      action: 'ACHIEVEMENT_UNLOCKED',
      target: achievementId,
      details: {
        timestamp: Date.now()
      }
    });

    alert(`🏆 実績解除: ${achievementId}`);
  };

  // 手動セーブ
  const saveGame = async () => {
    setShowSaveIndicator(true);
    const success = await saveManager.saveGame(gameState);
    
    setTimeout(() => setShowSaveIndicator(false), 2000);
    
    if (success) {
      console.log('ゲームを保存しました');
    }
  };

  // ゲームオーバー
  const gameOver = async () => {
    setIsPlaying(false);
    
    await logAction({
      action: 'GAME_OVER',
      details: {
        finalScore: gameState.score,
        level: gameState.level,
        playTime: gameState.playTime
      }
    });

    // ハイスコアチェック
    const highScore = localStorage.getItem('highScore') || 0;
    if (gameState.score > highScore) {
      localStorage.setItem('highScore', gameState.score);
      await unlockAchievement('new_high_score');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-yellow-400">🎮 セキュアゲーム</h1>
          <SecurityBadge />
        </div>
        <div className="flex items-center space-x-6 text-lg">
          <div>レベル: {gameState.level}</div>
          <div>スコア: {gameState.score.toLocaleString()}</div>
          <div>💰 {gameState.coins}</div>
          <div>❤️ {gameState.lives}</div>
        </div>
      </div>

      {/* ゲーム画面 */}
      <div className="bg-gray-800 rounded-lg p-8 mb-6" style={{ minHeight: '400px' }}>
        {!isPlaying ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-4xl font-bold mb-6 text-yellow-400">
              {gameState.level > 1 ? 'ゲームを再開' : 'ゲームスタート'}
            </h2>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transform hover:scale-105 transition"
            >
              プレイ開始
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-xl mb-4">ターゲットをクリックしてスコアを獲得！</p>
            </div>

            {/* ゲームアクション */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <button
                onClick={() => addScore(100)}
                className="p-4 bg-blue-600 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition"
              >
                +100点
              </button>
              <button
                onClick={() => earnCoins(10)}
                className="p-4 bg-yellow-600 rounded-lg hover:bg-yellow-700 transform hover:scale-105 transition"
              >
                +10コイン
              </button>
              <button
                onClick={levelUp}
                className="p-4 bg-purple-600 rounded-lg hover:bg-purple-700 transform hover:scale-105 transition"
              >
                レベルアップ
              </button>
            </div>

            {/* アイテムショップ */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">アイテムショップ</h3>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => purchaseItem('power_up', 50)}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                  disabled={gameState.coins < 50}
                >
                  パワーアップ (50コイン)
                </button>
                <button
                  onClick={() => purchaseItem('extra_life', 100)}
                  className="px-4 py-2 bg-pink-600 rounded hover:bg-pink-700"
                  disabled={gameState.coins < 100}
                >
                  エクストラライフ (100コイン)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* コントロール */}
      <div className="flex justify-between">
        <div className="space-x-3">
          <button
            onClick={saveGame}
            className="px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            セーブ
          </button>
          {isPlaying && (
            <button
              onClick={gameOver}
              className="px-6 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              終了
            </button>
          )}
        </div>

        {/* セーブインジケーター */}
        {showSaveIndicator && (
          <div className="flex items-center text-green-400">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            セーブ中...
          </div>
        )}
      </div>

      {/* 実績 */}
      {gameState.achievements.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">🏆 実績</h3>
          <div className="flex flex-wrap gap-2">
            {gameState.achievements.map(achievement => (
              <span key={achievement} className="px-3 py-1 bg-yellow-600 rounded-full text-sm">
                {achievement}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;