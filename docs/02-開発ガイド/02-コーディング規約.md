# コーディング標準

## TypeScript規約
```typescript
// ✅ Good: 明示的な型定義
interface IUser {
  id: string;
  name: string;
  role: 'admin' | 'staff' | 'user';
}

// ❌ Bad: any型の使用
const data: any = fetchData();
```

## React規約
```typescript
// ✅ Good: 適切なhooksの使用
const UserList: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const { isLoading, error } = useUserQuery();
  
  // メモ化
  const sortedUsers = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );
  
  return <div>...</div>;
};

// ❌ Bad: useEffectの過度な使用
```

## Supabase規約
```typescript
// ✅ Good: 型安全なクエリ
const { data, error } = await supabase
  .from('users')
  .select('*')
  .returns<IUser[]>();

// ❌ Bad: 型指定なし
const { data } = await supabase.from('users').select();
```
