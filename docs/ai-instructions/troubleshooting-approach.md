# トラブルシューティング指針

## 🆘 非エンジニアがつまづきやすいポイントと対策

### Docker Desktop インストールの注意点
```
Windows ユーザーの場合：
1. 「WSL2のインストールが必要」と出たら
   → AI: 「Windows用の準備が必要です。以下のコマンドをコピペしてください」
2. 「Hyper-Vを有効化」と出たら  
   → AI: 「PCの設定変更が必要です。画像付きで手順を説明します」

Mac ユーザーの場合：
1. 「Rosetta 2が必要」と出たら（M1/M2 Mac）
   → AI: 「1クリックで解決できます。以下をクリックしてください」
```

### GitHub 初期設定の簡略化
```
従来の方法（複雑）：
- SSHキー生成 → 設定 → 接続テスト...❌

簡単な方法（推奨）：
- GitHub CLIを使用 → `gh auth login` → ブラウザで認証 ✅
```

### よくあるエラーと魔法の解決策
```
エラー: Permission denied
解決: 「sudo chmod +x setup.sh」をコピペ

エラー: Docker daemon is not running  
解決: Docker Desktopを起動（象のアイコンをクリック）

エラー: Vercel deployment failed
解決: 「vercel logs」で原因を日本語で説明
```

## よくあるGitHubエラーと対処
- **rejected エラー**: リモートとローカルの不整合 → `git pull --rebase`
- **Permission denied**: 認証設定の問題 → アクセストークン確認
- **コンフリクト**: ファイルの衝突 → 手動マージまたはどちらか選択

## 環境変数が反映されない場合

### トラブルシューティング
- Next.jsを再起動する
- `NEXT_PUBLIC_`プレフィックスを確認（クライアントサイドで使用する場合）

### Vercelでの設定
1. Vercelダッシュボードで「Settings」→「Environment Variables」
2. 各環境変数を追加
3. デプロイを再実行

## 🎓 開発環境の統一化について

### なぜ最初から全ツールを使うのか
- **Docker**: 「動かない」問題を完全に防ぐ
- **GitHub**: 作業内容が消える心配をゼロに
- **Vercel**: 作ったものをすぐ見せられる

### 複雑に見えても大丈夫な理由
1. **Claude Codeが全自動設定**
2. **エラーが出ても日本語で解決**
3. **一度設定すれば、あとは忘れてOK**
4. **プロも使う環境で最初から開発**

## 💰 Vercel無料枠について
```
無料で使える範囲：
- 個人プロジェクト: 無制限
- 商用利用: 月間10万アクセスまで
- カスタムドメイン: 対応
- SSL証明書: 自動付与

これを超える場合：
→ まず起きません。心配な場合はAIに相談してください
```

## 🎁 ワンクリック初期設定スクリプト
```bash
# AIが作成する setup.sh
#!/bin/bash
echo "🚀 開発環境を準備中..."
docker-compose up -d
echo "✅ Docker環境準備完了"
git init && git add . && git commit -m "初回コミット"
echo "✅ Git初期化完了"
vercel --yes
echo "✅ Vercelデプロイ完了"
echo "🎉 すべての準備が整いました！"
```