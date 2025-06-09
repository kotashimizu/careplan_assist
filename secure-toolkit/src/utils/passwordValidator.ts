import { PasswordValidationResult } from '../types/validation';
import { PasswordPolicy } from '../types';

class PasswordValidator {
  private commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'password1', '123123', 'sunshine', 'iloveyou',
    'princess', 'rockyou', '1234567', '12345678', 'abc123',
    'nicole', 'daniel', 'babygirl', 'monkey', 'lovely',
    'jessica', '654321', 'michael', 'ashley', 'qwerty123'
  ];

  private defaultPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    preventCommonPasswords: true,
    maxLength: 128
  };

  /**
   * パスワードを検証
   */
  validate(password: string, policy?: PasswordPolicy): PasswordValidationResult {
    const effectivePolicy = { ...this.defaultPolicy, ...policy };
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // 基本的な長さチェック
    if (!password) {
      return {
        isValid: false,
        score: 0,
        errors: ['パスワードを入力してください'],
        suggestions: ['パスワードを入力してください']
      };
    }

    // 最小長度チェック
    if (effectivePolicy.minLength && password.length < effectivePolicy.minLength) {
      errors.push(`パスワードは${effectivePolicy.minLength}文字以上である必要があります`);
    } else {
      score += 10;
    }

    // 最大長度チェック
    if (effectivePolicy.maxLength && password.length > effectivePolicy.maxLength) {
      errors.push(`パスワードは${effectivePolicy.maxLength}文字以下である必要があります`);
    }

    // 大文字チェック
    if (effectivePolicy.requireUppercase) {
      if (!/[A-Z]/.test(password)) {
        errors.push('大文字を含める必要があります');
        suggestions.push('A-Zの大文字を1文字以上含めてください');
      } else {
        score += 15;
      }
    }

    // 小文字チェック
    if (effectivePolicy.requireLowercase) {
      if (!/[a-z]/.test(password)) {
        errors.push('小文字を含める必要があります');
        suggestions.push('a-zの小文字を1文字以上含めてください');
      } else {
        score += 15;
      }
    }

    // 数字チェック
    if (effectivePolicy.requireNumbers) {
      if (!/[0-9]/.test(password)) {
        errors.push('数字を含める必要があります');
        suggestions.push('0-9の数字を1文字以上含めてください');
      } else {
        score += 15;
      }
    }

    // 特殊文字チェック
    if (effectivePolicy.requireSpecialChars) {
      if (!/[^a-zA-Z0-9]/.test(password)) {
        errors.push('特殊文字を含める必要があります');
        suggestions.push('!@#$%^&*()などの特殊文字を含めてください');
      } else {
        score += 20;
      }
    }

    // 一般的なパスワードチェック
    if (effectivePolicy.preventCommonPasswords) {
      const lowerPassword = password.toLowerCase();
      if (this.commonPasswords.includes(lowerPassword)) {
        errors.push('一般的すぎるパスワードです');
        suggestions.push('より複雑でユニークなパスワードを選択してください');
      } else {
        score += 10;
      }

      // 簡単なパターンチェック
      if (this.hasSimplePattern(password)) {
        errors.push('単純なパターンは避けてください');
        suggestions.push('連続した文字や繰り返しパターンを避けてください');
      } else {
        score += 10;
      }
    }

    // 追加ボーナススコア
    if (password.length >= 12) score += 5;
    if (password.length >= 16) score += 5;
    if (this.hasVariedCharacters(password)) score += 10;

    return {
      isValid: errors.length === 0,
      score: Math.min(score, 100),
      errors,
      suggestions
    };
  }

  /**
   * パスワード強度を取得
   */
  getStrength(password: string): 'weak' | 'fair' | 'good' | 'strong' {
    const result = this.validate(password);
    
    if (result.score < 30) return 'weak';
    if (result.score < 60) return 'fair';
    if (result.score < 80) return 'good';
    return 'strong';
  }

  /**
   * 安全なパスワードを生成
   */
  generate(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let charset = lowercase + uppercase + numbers + special;
    let password = '';
    
    // 各カテゴリから最低1文字
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(special);
    
    // 残りの文字をランダムに選択
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(charset);
    }
    
    // シャッフル
    return this.shuffleString(password);
  }

  /**
   * 簡単なパターンをチェック
   */
  private hasSimplePattern(password: string): boolean {
    // 連続した数字 (123, 456など)
    if (/123|234|345|456|567|678|789|890/.test(password)) return true;
    
    // 連続したアルファベット (abc, def など)
    if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/.test(password.toLowerCase())) return true;
    
    // 繰り返し (aaa, 111 など)
    if (/(.)\1{2,}/.test(password)) return true;
    
    // キーボード配列 (qwerty, asdf など)
    if (/qwerty|asdf|zxcv|qwertyuiop|asdfghjkl|zxcvbnm/.test(password.toLowerCase())) return true;
    
    return false;
  }

  /**
   * 文字の多様性をチェック
   */
  private hasVariedCharacters(password: string): boolean {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    
    return [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length >= 3;
  }

  /**
   * 文字列からランダムな文字を取得
   */
  private getRandomChar(charset: string): string {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }

  /**
   * 文字列をシャッフル
   */
  private shuffleString(str: string): string {
    return str.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * パスワードの類似性をチェック
   */
  isSimilar(password1: string, password2: string): boolean {
    if (!password1 || !password2) return false;
    
    const similarity = this.calculateSimilarity(password1.toLowerCase(), password2.toLowerCase());
    return similarity > 0.8; // 80%以上類似している場合
  }

  /**
   * 文字列の類似度を計算（レーベンシュタイン距離）
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - matrix[str2.length][str1.length] / maxLength;
  }
}

export const passwordValidator = new PasswordValidator();