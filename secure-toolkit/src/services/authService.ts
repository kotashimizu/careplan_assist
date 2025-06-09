import { AuthUser, LoginCredentials, UserRole } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';

class AuthService {
  private users: Map<string, AuthUser & { password: string }> = new Map();

  constructor() {
    // デモ用のユーザーを初期化
    this.initDemoUsers();
  }

  private initDemoUsers() {
    const demoUsers = [
      {
        id: '1',
        email: 'admin@example.com',
        password: 'admin123',
        name: '管理者',
        role: 'admin' as UserRole,
        permissions: ['*']
      },
      {
        id: '2',
        email: 'user@example.com',
        password: 'user123',
        name: '一般ユーザー',
        role: 'user' as UserRole,
        permissions: ['read', 'write']
      },
      {
        id: '3',
        email: 'demo@example.com',
        password: 'demo123',
        name: 'デモユーザー',
        role: 'user' as UserRole,
        permissions: ['read']
      }
    ];

    demoUsers.forEach(user => {
      this.users.set(user.email, {
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // 実際の実装では、APIサーバーと通信
    const user = this.users.get(credentials.email);
    
    if (!user || user.password !== credentials.password) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    // パスワードを除外して返す
    const { password, ...authUser } = user;
    return authUser;
  }

  async logout(): Promise<void> {
    // 実際の実装では、サーバー側のセッションを破棄
    return Promise.resolve();
  }

  async register(userData: LoginCredentials & { name: string }): Promise<AuthUser> {
    // メールアドレスの重複チェック
    if (this.users.has(userData.email)) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    // 新規ユーザー作成
    const newUser: AuthUser & { password: string } = {
      id: uuidv4(),
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: 'user',
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(userData.email, newUser);

    // パスワードを除外して返す
    const { password, ...authUser } = newUser;
    return authUser;
  }

  async validateToken(token: string): Promise<AuthUser | null> {
    // 実際の実装では、JWTトークンの検証
    // デモ用に簡易実装
    try {
      const decoded = JSON.parse(atob(token));
      const user = this.users.get(decoded.email);
      if (user) {
        const { password, ...authUser } = user;
        return authUser;
      }
    } catch {
      // Invalid token
    }
    return null;
  }

  async refreshToken(token: string): Promise<string> {
    // 実際の実装では、新しいトークンを発行
    const user = await this.validateToken(token);
    if (!user) {
      throw new Error('Invalid token');
    }
    
    // 新しいトークンを生成（デモ用）
    return btoa(JSON.stringify({ email: user.email, timestamp: Date.now() }));
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // ユーザーを検索
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    if (user.password !== oldPassword) {
      throw new Error('現在のパスワードが正しくありません');
    }

    // パスワード更新
    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
  }

  async requestPasswordReset(email: string): Promise<void> {
    // 実際の実装では、パスワードリセットメールを送信
    const user = this.users.get(email);
    if (!user) {
      // セキュリティのため、ユーザーが存在しない場合もエラーを出さない
      return;
    }

    console.log(`Password reset requested for ${email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // 実際の実装では、トークンを検証してパスワードをリセット
    // デモ用の簡易実装
    console.log('Password reset with token:', token);
  }
}

export const authService = new AuthService();