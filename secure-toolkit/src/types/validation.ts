// バリデーション関連の型定義

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface PasswordValidationResult extends ValidationResult {
  score: number;
  suggestions: string[];
}

export interface EmailValidationResult extends ValidationResult {
  normalized?: string;
}

export interface FieldValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => ValidationResult;
}

export interface FormValidationSchema {
  [fieldName: string]: FieldValidationRules;
}