# UIコンポーネントガイド

## デザインシステム
- カラーパレット
  - プライマリ: #4361ee (青)
  - セカンダリ: #3f37c9 (紺)
  - アクセント: #f72585 (ピンク)
  - 成功: #4cc9f0 (水色)
  - 警告: #f9c74f (黄)
  - エラー: #ef233c (赤)
  - テキスト: #2b2d42 (黒)
  - 背景: #ffffff (白)
  - 背景サブ: #f8f9fa (薄グレー)

- タイポグラフィ
  - 見出し: Noto Sans JP, sans-serif
  - 本文: Noto Sans JP, sans-serif
  - サイズ階層: 12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px

- スペーシング
  - 基本単位: 4px
  - スケール: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

- ブレークポイント
  - モバイル: ~640px
  - タブレット: 641px~1024px
  - デスクトップ: 1025px~

## 共通コンポーネント
### Button
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
```

使用例:
```tsx
<Button variant="primary" size="md" onClick={handleSubmit}>
  保存する
</Button>
```

### Input
```typescript
interface InputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}
```

使用例:
```tsx
<Input
  id="user-name"
  label="利用者名"
  value={userName}
  onChange={handleNameChange}
  required
/>
```

### Select
```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}
```

使用例:
```tsx
<Select
  id="care-level"
  label="介護度"
  options={[
    { value: 'support1', label: '要支援1' },
    { value: 'support2', label: '要支援2' },
    { value: 'care1', label: '要介護1' },
    // ...
  ]}
  value={careLevel}
  onChange={handleCareLevelChange}
  required
/>
```

## レイアウトパターン
### カード
```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

使用例:
```tsx
<Card title="利用者情報">
  <div className="p-4">
    <p>名前: 山田 太郎</p>
    <p>介護度: 要介護2</p>
  </div>
  <div className="flex justify-end p-2">
    <Button variant="secondary" size="sm">詳細</Button>
  </div>
</Card>
```

### グリッドレイアウト
```typescript
interface GridProps {
  columns: number;
  gap?: number;
  children: React.ReactNode;
}
```

使用例:
```tsx
<Grid columns={3} gap={16}>
  <Card title="利用者1">...</Card>
  <Card title="利用者2">...</Card>
  <Card title="利用者3">...</Card>
</Grid>
```

### フォームレイアウト
```typescript
interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}
```

使用例:
```tsx
<Form onSubmit={handleSubmit}>
  <Input id="name" label="名前" value={name} onChange={handleNameChange} />
  <Select id="gender" label="性別" options={genderOptions} value={gender} onChange={handleGenderChange} />
  <div className="flex justify-end mt-4">
    <Button variant="secondary" size="md" onClick={handleCancel}>キャンセル</Button>
    <Button variant="primary" size="md" type="submit">保存</Button>
  </div>
</Form>
```
