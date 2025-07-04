# Git自動化ルール

## 完全自動化の原則
**ユーザーがGit操作を意識する必要は一切ありません。**
AIが以下のタイミングで自動的にGit操作を実行します。

## 自動コミットの詳細タイミング

### 1. 即座にコミット（5分以内）
- 新規ファイルの作成
- 重要な機能の実装完了
- バグ修正の完了
- 設定ファイルの変更
- DEVELOPMENT_SCHEDULE.mdの更新

### 2. 定期コミット（30分ごと）
- 作業が30分継続したら自動コミット
- コミットメッセージ例：「作業中の進捗を保存」

### 3. 区切りコミット
- ユーザーが「ありがとう」「OK」など肯定的な返答をした時
- ユーザーが新しい機能を要望した時（現在の作業を保存）
- エラーが解決した時

## ブランチ自動管理

### ブランチ作成タイミング
```
自動判断基準：
- 新機能の開発 → feature/機能名
- バグ修正 → fix/問題の内容
- デザイン変更 → design/変更内容
- 実験的な変更 → experiment/内容
```

### ブランチ命名規則
```
feature/user-auth     # ユーザー認証機能
fix/login-error      # ログインエラー修正
design/dark-mode     # ダークモード対応
```

### 自動マージ
- 機能が完成したら自動的にmainにマージ
- コンフリクトがある場合はユーザーに確認

## プッシュについて
- **基本的にはローカルコミットのみ**
- GitHubが設定されている場合のみ、以下のタイミングでプッシュ：
  - 1日の作業終了時
  - 重要な機能の完成時
  - ユーザーが明示的に要求した時

## コミットメッセージの自動生成
```
# 形式
[カテゴリ] 具体的な変更内容

# 例
[機能追加] ユーザー認証機能を実装
[バグ修正] ログイン時のエラーを解消
[デザイン] ヘッダーのレイアウトを改善
[設定] ESLintの設定を追加
[ドキュメント] READMEを更新
[リファクタ] コンポーネントの構造を整理
```

## AIからの能動的提案

### 大きな変更指示を受けた場合
```
ユーザー: 「TODOリストのデザインを全部変えて、カレンダー機能も追加してください」

AI: 「大きな変更になりますね。安全のため以下を提案します：
1. まず現在の進捗をコミットしましょうか？
2. 新機能用のブランチを作成しますか？
3. デザイン変更とカレンダー機能を別々に実装しますか？

どのように進めますか？」
```

### 複数ファイル変更の場合
```
ユーザー: 「認証システムを追加して、全ページに適用してください」

AI: 「認証システムは重要な機能ですね。以下の手順で安全に実装します：
1. feature/auth ブランチを作成
2. 段階的に実装（ログイン→ページ保護→テスト）
3. 各段階でコミット

この進め方でよろしいですか？」
```

## Git操作実行例
```bash
# AIが自動で以下を実行：
git checkout -b feature/todo-list
git add .
git commit -m "TODOリスト機能を追加"
git checkout main
git merge feature/todo-list
git push origin main
```

## GitHub初期設定
GitHubで空のリポジトリを作成する際の設定：
- Repository name: 任意の名前
- Public/Private: どちらでもOK
- Add a README file: ❌ チェックしない！
- Add .gitignore: ❌ None を選択！
- Choose a license: ❌ None を選択！

## 日常的なGit操作の指示例
```
朝：「GitHubから最新の状態を取得してください」
作業中：「今の変更を保存してください。コミットメッセージは『○○』で」
夜：「今日の作業をGitHubにアップロードしてください」
```

## よくあるGitHubエラーと対処
- **rejected エラー**: リモートとローカルの不整合 → `git pull --rebase`
- **Permission denied**: 認証設定の問題 → アクセストークン確認
- **コンフリクト**: ファイルの衝突 → 手動マージまたはどちらか選択