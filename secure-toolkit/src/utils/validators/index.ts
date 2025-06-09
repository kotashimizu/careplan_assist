export { emailValidator } from './emailValidator';
export { passwordValidator } from '../passwordValidator';

// 共通のバリデーション関数
export const validators = {
  required: (value: any, fieldName: string = 'フィールド') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName}を入力してください`;
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string = 'フィールド') => {
    if (value.length < min) {
      return `${fieldName}は${min}文字以上である必要があります`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string = 'フィールド') => {
    if (value.length > max) {
      return `${fieldName}は${max}文字以下である必要があります`;
    }
    return null;
  },

  pattern: (value: string, pattern: RegExp, errorMessage: string) => {
    if (!pattern.test(value)) {
      return errorMessage;
    }
    return null;
  },

  url: (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return '有効なURLを入力してください';
    }
  },

  phoneNumber: (value: string) => {
    // 日本の電話番号形式をチェック
    const phoneRegex = /^(0[0-9]{1,4}-?[0-9]{1,4}-?[0-9]{4}|0[789]0-?[0-9]{4}-?[0-9]{4})$/;
    if (!phoneRegex.test(value.replace(/[^\d-]/g, ''))) {
      return '有効な電話番号を入力してください';
    }
    return null;
  }
};