interface SanitizeOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  removeScripts?: boolean;
  encodeEntities?: boolean;
}

class Sanitizer {
  private readonly defaultOptions: SanitizeOptions = {
    allowHtml: false,
    allowedTags: [],
    removeScripts: true,
    encodeEntities: true
  };

  /**
   * 文字列をサニタイズ
   */
  sanitize(input: string, options?: SanitizeOptions): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const opts = { ...this.defaultOptions, ...options };
    let sanitized = input;

    // スクリプトタグを除去
    if (opts.removeScripts) {
      sanitized = this.removeScripts(sanitized);
    }

    // HTMLタグの処理
    if (!opts.allowHtml) {
      sanitized = this.stripHtml(sanitized);
    } else if (opts.allowedTags && opts.allowedTags.length > 0) {
      sanitized = this.allowOnlySpecificTags(sanitized, opts.allowedTags);
    }

    // HTMLエンティティのエンコード
    if (opts.encodeEntities) {
      sanitized = this.encodeHtmlEntities(sanitized);
    }

    // 危険な文字のエスケープ
    sanitized = this.escapeDangerousChars(sanitized);

    return sanitized.trim();
  }

  /**
   * SQLインジェクション対策
   */
  sanitizeForSql(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/'/g, "''") // シングルクォートをエスケープ
      .replace(/;/g, '') // セミコロンを除去
      .replace(/--/g, '') // SQLコメントを除去
      .replace(/\/\*/g, '') // SQLコメント開始を除去
      .replace(/\*\//g, '') // SQLコメント終了を除去
      .replace(/xp_/gi, '') // 拡張ストアドプロシージャを除去
      .replace(/sp_/gi, '') // ストアドプロシージャを除去
      .trim();
  }

  /**
   * XSS対策
   */
  sanitizeForXss(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  /**
   * ファイル名のサニタイズ
   */
  sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return 'untitled';
    }

    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // 安全な文字以外を_に置換
      .replace(/_{2,}/g, '_') // 連続するアンダースコアを1つに
      .replace(/^_+|_+$/g, '') // 先頭末尾のアンダースコアを除去
      .substring(0, 255) // 長さ制限
      || 'untitled';
  }

  /**
   * メールアドレスの検証とサニタイズ
   */
  sanitizeEmail(email: string): string | null {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized)) {
      return null;
    }

    return sanitized;
  }

  /**
   * 電話番号のサニタイズ
   */
  sanitizePhoneNumber(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    return phone
      .replace(/[^0-9+()-]/g, '') // 数字と一部記号のみ残す
      .replace(/^00/, '+') // 国際プレフィックスを統一
      .trim();
  }

  /**
   * URLのサニタイズ
   */
  sanitizeUrl(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    const sanitized = url.trim();
    
    // 危険なプロトコルをチェック
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
    for (const protocol of dangerousProtocols) {
      if (sanitized.toLowerCase().startsWith(protocol)) {
        return null;
      }
    }

    try {
      const urlObj = new URL(sanitized);
      return urlObj.toString();
    } catch {
      // 相対URLの場合
      if (sanitized.startsWith('/') || sanitized.startsWith('./')) {
        return sanitized;
      }
      return null;
    }
  }

  /**
   * IPアドレスのサニタイズ
   */
  sanitizeIpAddress(ip: string): string | null {
    if (!ip || typeof ip !== 'string') {
      return null;
    }

    const sanitized = ip.trim();
    
    // IPv4の検証
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(sanitized)) {
      const parts = sanitized.split('.');
      const validParts = parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
      
      if (validParts) {
        return sanitized;
      }
    }

    // IPv6の簡易チェック
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(sanitized)) {
      return sanitized.toLowerCase();
    }

    return null;
  }

  /**
   * スクリプトタグを除去
   */
  private removeScripts(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '');
  }

  /**
   * すべてのHTMLタグを除去
   */
  private stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  /**
   * 指定されたタグのみを許可
   */
  private allowOnlySpecificTags(input: string, allowedTags: string[]): string {
    const tagRegex = /<(\/?)([\w]+)[^>]*>/g;
    
    return input.replace(tagRegex, (match, _closing, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match;
      }
      return '';
    });
  }

  /**
   * HTMLエンティティをエンコード
   */
  private encodeHtmlEntities(input: string): string {
    const entities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return input.replace(/[&<>"'/]/g, (char) => entities[char] || char);
  }

  /**
   * 危険な文字をエスケープ
   */
  private escapeDangerousChars(input: string): string {
    return input
      .replace(/\x00/g, '') // NULLバイトを除去
      .replace(/\x1a/g, '') // SUBを除去
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, ''); // 制御文字を除去
  }

  /**
   * 複数行テキストのサニタイズ
   */
  sanitizeMultilineText(input: string, maxLines?: number): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let lines = input.split('\n').map(line => this.sanitize(line));
    
    if (maxLines && lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
    }

    return lines.join('\n');
  }

  /**
   * JSON文字列のサニタイズ
   */
  sanitizeJsonString(input: string): string | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    try {
      const parsed = JSON.parse(input);
      // 再度文字列化してサニタイズされたJSONを作成
      return JSON.stringify(parsed);
    } catch {
      return null;
    }
  }
}

export const sanitizer = new Sanitizer();