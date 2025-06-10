# API仕様書

## Supabase Tables

### users テーブル
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | uuid | PRIMARY KEY | ユーザーID |
| email | text | UNIQUE NOT NULL | メールアドレス |
| name | text | NOT NULL | ユーザー名 |
| role | text | NOT NULL | ロール |

### care_users テーブル
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | uuid | PRIMARY KEY | 利用者ID |
| name | text | NOT NULL | 利用者名 |
| kana_name | text | NOT NULL | かな氏名 |
| gender | text | NOT NULL | 性別 |
| birth_date | date | NOT NULL | 生年月日 |
| care_level | text | NOT NULL | 介護度 |
| address | text | | 住所 |
| phone | text | | 電話番号 |
| emergency_contact | text | | 緊急連絡先 |
| medical_history | text | | 既往症 |
| allergies | text | | アレルギー情報 |
| photo_url | text | | 顔写真URL |

## Gemini API使用方法
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// 要約機能
async function summarizeNotes(notes: string[]): Promise<string> {
  const prompt = `以下の介護記録を要約してください：\n${notes.join('\n')}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```
