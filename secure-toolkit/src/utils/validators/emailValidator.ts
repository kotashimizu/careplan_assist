import { EmailValidationResult } from '../../types/validation';

class EmailValidator {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly disposableEmailDomains = [
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'throwaway.email'
  ];

  /**
   * メールアドレスを検証
   */
  validate(email: string): EmailValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!email) {
      return {
        isValid: false,
        errors: ['メールアドレスを入力してください']
      };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 基本的な形式チェック
    if (!this.emailRegex.test(trimmedEmail)) {
      errors.push('有効なメールアドレスの形式ではありません');
    }

    // 長さチェック
    if (trimmedEmail.length > 254) {
      errors.push('メールアドレスが長すぎます（最大254文字）');
    }

    // ドメイン部分のチェック
    const [localPart, domain] = trimmedEmail.split('@');
    
    if (localPart && localPart.length > 64) {
      errors.push('ローカル部が長すぎます（最大64文字）');
    }

    // 使い捨てメールアドレスの警告
    if (domain && this.disposableEmailDomains.includes(domain)) {
      warnings.push('使い捨てメールアドレスの可能性があります');
    }

    // 特殊文字のチェック
    if (this.hasInvalidCharacters(trimmedEmail)) {
      errors.push('使用できない文字が含まれています');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      normalized: trimmedEmail
    };
  }

  /**
   * メールアドレスの正規化
   */
  normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * 無効な文字をチェック
   */
  private hasInvalidCharacters(email: string): boolean {
    // 制御文字やスペースのチェック
    return /[\x00-\x1F\x7F]/.test(email) || /\s/.test(email);
  }

  /**
   * メールアドレスのドメイン部分を取得
   */
  getDomain(email: string): string | null {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1] : null;
  }

  /**
   * メールアドレスのローカル部分を取得
   */
  getLocalPart(email: string): string | null {
    const parts = email.split('@');
    return parts.length === 2 ? parts[0] : null;
  }
}

export const emailValidator = new EmailValidator();