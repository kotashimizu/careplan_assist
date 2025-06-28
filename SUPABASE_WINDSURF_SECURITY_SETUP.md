# 🚀 Supabase + Windsurf 統合セキュリティ設定ガイド

## 📋 目次
1. [Supabase初期設定](#supabase初期設定)
2. [Windsurf MCP連携設定](#windsurf-mcp連携設定)
3. [セキュリティベストプラクティス](#セキュリティベストプラクティス)
4. [段階別セキュリティ実装](#段階別セキュリティ実装)

---

## 🔧 Supabase初期設定

### 1. プロジェクトセットアップ

#### 環境変数の設定（.env.local）
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]  # 本番環境用（サーバーサイドのみ）
```

#### Supabaseクライアントの初期化
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',  // PKCE認証フローを使用（推奨）
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### 2. 認証設定

#### 基本的な認証実装
```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
```

### 3. データベース初期設定

#### 基本的なテーブル作成とRLS設定
```sql
-- プロファイルテーブルの作成
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

---

## 🔌 Windsurf MCP連携設定

### 1. MCP設定ファイルの作成

#### mcp_config.json
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=[YOUR_PROJECT_REF]",
        "--features=database,docs"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "[YOUR_PERSONAL_ACCESS_TOKEN]"
      }
    }
  }
}
```

### 2. Windsurf設定手順

1. **Windsurfを開く**
2. **Cascadeアシスタントに移動**
3. **ハンマーアイコン（MCP）をクリック**
4. **「Configure」を選択**
5. **上記の設定を貼り付けて保存**

### 3. 安全な連携のための推奨設定

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",  // 読み取り専用モード（推奨）
        "--project-ref=[YOUR_PROJECT_REF]",
        "--features=database,docs"  // 必要な機能のみ有効化
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "[YOUR_PERSONAL_ACCESS_TOKEN]"
      }
    }
  }
}
```

### 4. 利用可能なコマンド例

```plaintext
// Windsurfで使用できるコマンド
"Show me all tables in my Supabase database"
"Create a new table for user posts"
"Generate TypeScript types from my schema"
"Show recent error logs"
```

---

## 🔐 セキュリティベストプラクティス

### 1. Row Level Security (RLS) の徹底

#### 効率的なRLSポリシーの書き方
```sql
-- ❌ 非効率な例（auth.uid()を直接呼び出し）
CREATE POLICY "bad_policy" ON posts
  USING (auth.uid() = user_id);

-- ✅ 効率的な例（SELECTでラップ）
CREATE POLICY "good_policy" ON posts
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ✅ さらに効率的（セキュリティ定義関数を使用）
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid()
$$;

CREATE POLICY "best_policy" ON posts
  TO authenticated
  USING (auth.user_id() = user_id);
```

#### 複雑な権限管理
```sql
-- チーム・組織ベースのアクセス制御
CREATE OR REPLACE FUNCTION private.user_teams()
RETURNS int[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT team_id 
    FROM team_members 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "team_access" ON documents
  TO authenticated
  USING (team_id = ANY(private.user_teams()));
```

### 2. Multi-Factor Authentication (MFA) の実装

#### MFA必須ポリシー
```sql
-- MFAを完了したユーザーのみアクセス可能
CREATE POLICY "require_mfa" ON sensitive_data
  AS RESTRICTIVE
  TO authenticated
  USING ((SELECT auth.jwt()->>'aal') = 'aal2');

-- 条件付きMFA（MFAを設定したユーザーには必須）
CREATE POLICY "conditional_mfa" ON important_data
  AS RESTRICTIVE
  TO authenticated
  USING (
    ARRAY[auth.jwt()->>'aal'] <@ (
      SELECT
        CASE
          WHEN COUNT(id) > 0 THEN ARRAY['aal2']
          ELSE ARRAY['aal1', 'aal2']
        END AS aal
      FROM auth.mfa_factors
      WHERE user_id = auth.uid() AND status = 'verified'
    )
  );
```

#### MFA実装コード
```typescript
// src/components/MFASetup.tsx
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function MFASetup() {
  const [qrCode, setQrCode] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [factorId, setFactorId] = useState<string>('')

  const enrollMFA = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    })
    
    if (data) {
      setQrCode(data.totp.qr_code)
      setFactorId(data.id)
    }
  }

  const verifyMFA = async () => {
    const { data: challengeData } = await supabase.auth.mfa.challenge({
      factorId
    })
    
    if (challengeData) {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode
      })
      
      if (!error) {
        // MFA設定完了
        await supabase.auth.refreshSession()
      }
    }
  }

  return (
    <div>
      {!qrCode ? (
        <button onClick={enrollMFA}>MFAを設定する</button>
      ) : (
        <div>
          <img src={qrCode} alt="MFA QR Code" />
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="認証コードを入力"
          />
          <button onClick={verifyMFA}>確認</button>
        </div>
      )}
    </div>
  )
}
```

### 3. セキュアなファイルストレージ

#### ストレージポリシーの設定
```sql
-- プライベートバケットの作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false);

-- ユーザー専用フォルダへのアクセス制御
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'user-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'user-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'user-files' AND
    owner = auth.uid()::text
  );
```

### 4. APIセキュリティ

#### Edge Functionでのセキュリティ
```typescript
// supabase/functions/secure-endpoint/index.ts
import { createClient } from '@supabase/supabase-js'

export const handler = async (req: Request): Promise<Response> => {
  // Authヘッダーの検証
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Supabaseクライアントを認証情報付きで作成
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: { Authorization: authHeader }
      }
    }
  )

  // ユーザー情報の取得と検証
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // RLSが自動的に適用される
  const { data, error: queryError } = await supabase
    .from('sensitive_data')
    .select('*')

  return new Response(JSON.stringify({ data }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

---

## 📊 段階別セキュリティ実装

### レベル1: 最小限のセキュリティ（個人プロジェクト）

```typescript
// 基本的な認証のみ
const MINIMAL_SECURITY = {
  auth: {
    enabled: true,
    providers: ['email'],
    mfa: false
  },
  rls: {
    enabled: true,
    policies: 'basic'  // ユーザー自身のデータのみ
  },
  encryption: false,
  auditLog: false
}
```

#### 実装例
```sql
-- 最小限のRLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data" ON user_data
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### レベル2: 標準セキュリティ（一般的なWebアプリ）

```typescript
// 標準的なセキュリティ設定
const STANDARD_SECURITY = {
  auth: {
    enabled: true,
    providers: ['email', 'google', 'github'],
    mfa: 'optional',
    sessionTimeout: 3600  // 1時間
  },
  rls: {
    enabled: true,
    policies: 'standard'  // チーム・組織ベース
  },
  encryption: {
    pii: true,  // 個人情報のみ暗号化
    method: 'AES-256'
  },
  auditLog: {
    enabled: true,
    events: ['login', 'data_access', 'data_modification']
  }
}
```

#### 実装例
```typescript
// src/lib/security/encryption.ts
import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

export function encryptPII(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
}

export function decryptPII(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// 使用例
const encryptedEmail = encryptPII(user.email)
const encryptedPhone = encryptPII(user.phone)
```

### レベル3: 厳格セキュリティ（医療・金融向け）

```typescript
// 厳格なセキュリティ設定
const STRICT_SECURITY = {
  auth: {
    enabled: true,
    providers: ['email'],  // 制限
    mfa: 'required',
    sessionTimeout: 900,  // 15分
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5
    }
  },
  rls: {
    enabled: true,
    policies: 'strict',
    dataClassification: true
  },
  encryption: {
    allData: true,
    method: 'AES-256-GCM',
    keyRotation: true
  },
  auditLog: {
    enabled: true,
    events: 'all',
    retention: '7 years',
    immutable: true
  },
  compliance: {
    hipaa: true,
    gdpr: true,
    pci_dss: true
  }
}
```

#### 実装例：監査ログシステム
```sql
-- 監査ログテーブル
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  risk_score INTEGER DEFAULT 0
);

-- 監査ログは削除・更新不可
CREATE POLICY "Audit logs are append-only" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- トリガーで自動記録
CREATE OR REPLACE FUNCTION log_data_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id::text,
    jsonb_build_object(
      'query', current_query(),
      'timestamp', NOW()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重要テーブルにトリガーを設定
CREATE TRIGGER audit_sensitive_data
  AFTER INSERT OR UPDATE OR DELETE ON sensitive_data
  FOR EACH ROW EXECUTE FUNCTION log_data_access();
```

---

## 🎯 実装チェックリスト

### 初期設定時
- [ ] Supabase プロジェクトの作成
- [ ] 環境変数の設定（.env.local）
- [ ] Supabaseクライアントの初期化
- [ ] 基本的な認証フローの実装
- [ ] RLSの有効化と基本ポリシーの設定

### Windsurf連携時
- [ ] Personal Access Token の生成
- [ ] MCP設定ファイルの作成
- [ ] Windsurfでの設定完了
- [ ] 読み取り専用モードの確認

### セキュリティ強化時
- [ ] 適切なセキュリティレベルの選択
- [ ] RLSポリシーの最適化
- [ ] 必要に応じてMFAの実装
- [ ] 監査ログの設定
- [ ] 定期的なセキュリティレビュー

---

## 📚 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase RLSガイド](https://supabase.com/docs/guides/auth/row-level-security)
- [Windsurf MCP設定ガイド](https://windsurf.com/docs/mcp)
- [セキュリティベストプラクティス](https://supabase.com/docs/guides/auth/security)

---

## 🤝 サポート

問題が発生した場合は、以下を確認してください：

1. **環境変数が正しく設定されているか**
2. **RLSが有効になっているか**
3. **適切な権限が設定されているか**
4. **Windsurfの設定が正しいか**

それでも解決しない場合は、エラーメッセージと共にAIに相談してください。