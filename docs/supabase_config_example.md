# Supabase設定情報（参考用）

以下の情報をコピーして`.env.local`ファイルに貼り付けてください。

```
# 環境設定
VITE_ENVIRONMENT=local

# Supabase設定
# 実際のプロジェクトURLとAnonキーを以下に入力してください
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 使い方：
# 1. Supabaseダッシュボードから「Project URL」と「anon public」のキーをコピー
# 2. 上記の設定例のプレースホルダーを実際の値に置き換え
# 3. ファイルを保存
```

**注意事項**：
- このファイルは参考用です。実際の設定は`.env.local`に行ってください
- Supabaseの認証情報は公開しないよう注意してください
- `.env.local`ファイルはGitにコミットされないようになっています
