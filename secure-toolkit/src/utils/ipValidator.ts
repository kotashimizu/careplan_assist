interface IpValidationResult {
  isValid: boolean;
  type: 'ipv4' | 'ipv6' | 'invalid';
  isPrivate: boolean;
  isLoopback: boolean;
  isMulticast: boolean;
  country?: string;
  region?: string;
}

class IpValidator {
  private readonly privateRanges = [
    // IPv4 Private ranges
    { start: '10.0.0.0', end: '10.255.255.255' },
    { start: '172.16.0.0', end: '172.31.255.255' },
    { start: '192.168.0.0', end: '192.168.255.255' },
    
    // IPv4 Loopback
    { start: '127.0.0.0', end: '127.255.255.255' },
    
    // IPv4 Link-local
    { start: '169.254.0.0', end: '169.254.255.255' },
    
    // IPv4 Multicast
    { start: '224.0.0.0', end: '239.255.255.255' }
  ];

  /**
   * IPアドレスを検証
   */
  validate(ip: string): IpValidationResult {
    const result: IpValidationResult = {
      isValid: false,
      type: 'invalid',
      isPrivate: false,
      isLoopback: false,
      isMulticast: false
    };

    if (!ip || typeof ip !== 'string') {
      return result;
    }

    const trimmedIp = ip.trim();

    // IPv4チェック
    if (this.isValidIPv4(trimmedIp)) {
      result.isValid = true;
      result.type = 'ipv4';
      result.isPrivate = this.isPrivateIPv4(trimmedIp);
      result.isLoopback = this.isLoopbackIPv4(trimmedIp);
      result.isMulticast = this.isMulticastIPv4(trimmedIp);
      return result;
    }

    // IPv6チェック
    if (this.isValidIPv6(trimmedIp)) {
      result.isValid = true;
      result.type = 'ipv6';
      result.isPrivate = this.isPrivateIPv6(trimmedIp);
      result.isLoopback = this.isLoopbackIPv6(trimmedIp);
      result.isMulticast = this.isMulticastIPv6(trimmedIp);
      return result;
    }

    return result;
  }

  /**
   * IPv4アドレスの検証
   */
  isValidIPv4(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);
    
    if (!match) return false;

    return match.slice(1).every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255 && octet === num.toString();
    });
  }

  /**
   * IPv6アドレスの検証
   */
  isValidIPv6(ip: string): boolean {
    // 簡略表記の展開
    let expandedIp = this.expandIPv6(ip);
    
    if (!expandedIp) return false;

    // 完全なIPv6形式をチェック
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv6Regex.test(expandedIp);
  }

  /**
   * プライベートIPアドレスかチェック
   */
  isPrivate(ip: string): boolean {
    const validation = this.validate(ip);
    return validation.isPrivate;
  }

  /**
   * ループバックアドレスかチェック
   */
  isLoopback(ip: string): boolean {
    const validation = this.validate(ip);
    return validation.isLoopback;
  }

  /**
   * パブリックIPアドレスかチェック
   */
  isPublic(ip: string): boolean {
    const validation = this.validate(ip);
    return validation.isValid && !validation.isPrivate && !validation.isLoopback;
  }

  /**
   * IPアドレスの範囲内かチェック
   */
  isInRange(ip: string, startIp: string, endIp: string): boolean {
    if (!this.isValidIPv4(ip) || !this.isValidIPv4(startIp) || !this.isValidIPv4(endIp)) {
      return false;
    }

    const ipNum = this.ipToNumber(ip);
    const startNum = this.ipToNumber(startIp);
    const endNum = this.ipToNumber(endIp);

    return ipNum >= startNum && ipNum <= endNum;
  }

  /**
   * CIDR形式のサブネットマスクチェック
   */
  isInSubnet(ip: string, subnet: string): boolean {
    const [networkIp, prefixLength] = subnet.split('/');
    
    if (!this.isValidIPv4(ip) || !this.isValidIPv4(networkIp)) {
      return false;
    }

    const prefix = parseInt(prefixLength, 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
      return false;
    }

    const ipNum = this.ipToNumber(ip);
    const networkNum = this.ipToNumber(networkIp);
    const mask = 0xFFFFFFFF << (32 - prefix);

    return (ipNum & mask) === (networkNum & mask);
  }

  /**
   * IPアドレスの地理的位置を推定（簡易版）
   */
  async getGeolocation(ip: string): Promise<{ country?: string; region?: string; city?: string } | null> {
    if (!this.isPublic(ip)) {
      return null;
    }

    try {
      // 実際の実装では外部APIを使用
      // この例では日本の範囲を簡易チェック
      if (this.isJapaneseIP(ip)) {
        return {
          country: 'JP',
          region: 'Unknown',
          city: 'Unknown'
        };
      }
      
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown'
      };
    } catch (error) {
      console.error('Geolocation lookup failed:', error);
      return null;
    }
  }

  /**
   * 不審なIPアドレスかチェック
   */
  isSuspicious(ip: string): boolean {
    // 既知の悪意のあるIP範囲（例）
    const _suspiciousRanges = [
      // この例では空ですが、実際には脅威インテリジェンスDBから取得
    ];

    // TOR exit nodeやプロキシの検出
    if (this.isTorExitNode(ip)) {
      return true;
    }

    // 過度なリクエストの履歴チェック
    if (this.hasExcessiveRequests(ip)) {
      return true;
    }

    return false;
  }

  /**
   * IPv4のプライベートアドレスチェック
   */
  private isPrivateIPv4(ip: string): boolean {
    return this.privateRanges.some(range => 
      this.isInRange(ip, range.start, range.end)
    );
  }

  /**
   * IPv4のループバックアドレスチェック
   */
  private isLoopbackIPv4(ip: string): boolean {
    return this.isInRange(ip, '127.0.0.0', '127.255.255.255');
  }

  /**
   * IPv4のマルチキャストアドレスチェック
   */
  private isMulticastIPv4(ip: string): boolean {
    return this.isInRange(ip, '224.0.0.0', '239.255.255.255');
  }

  /**
   * IPv6のプライベートアドレスチェック
   */
  private isPrivateIPv6(ip: string): boolean {
    const expandedIp = this.expandIPv6(ip);
    if (!expandedIp) return false;

    // RFC 4193 Unique Local Addresses
    return expandedIp.startsWith('fc') || expandedIp.startsWith('fd');
  }

  /**
   * IPv6のループバックアドレスチェック
   */
  private isLoopbackIPv6(ip: string): boolean {
    const expandedIp = this.expandIPv6(ip);
    return expandedIp === '0000:0000:0000:0000:0000:0000:0000:0001';
  }

  /**
   * IPv6のマルチキャストアドレスチェック
   */
  private isMulticastIPv6(ip: string): boolean {
    const expandedIp = this.expandIPv6(ip);
    if (!expandedIp) return false;

    return expandedIp.startsWith('ff');
  }

  /**
   * IPv6アドレスを完全形式に展開
   */
  private expandIPv6(ip: string): string | null {
    try {
      // :: の展開
      if (ip.includes('::')) {
        const parts = ip.split('::');
        if (parts.length !== 2) return null;

        const leftParts = parts[0] ? parts[0].split(':') : [];
        const rightParts = parts[1] ? parts[1].split(':') : [];
        const missingParts = 8 - leftParts.length - rightParts.length;

        if (missingParts < 0) return null;

        const expandedParts = [
          ...leftParts,
          ...Array(missingParts).fill('0000'),
          ...rightParts
        ];

        return expandedParts.map(part => part.padStart(4, '0')).join(':');
      }

      // 通常の形式
      const parts = ip.split(':');
      if (parts.length !== 8) return null;

      return parts.map(part => part.padStart(4, '0')).join(':');
    } catch {
      return null;
    }
  }

  /**
   * IPv4アドレスを数値に変換
   */
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  }

  /**
   * 日本のIPアドレス範囲かチェック（簡易版）
   */
  private isJapaneseIP(ip: string): boolean {
    // 実際の実装では、APNIC等のレジストリデータを使用
    // この例では一部の日本の範囲のみ
    const japaneseRanges = [
      { start: '133.0.0.0', end: '133.255.255.255' },
      { start: '210.0.0.0', end: '210.255.255.255' },
      // 他の範囲...
    ];

    return japaneseRanges.some(range => 
      this.isInRange(ip, range.start, range.end)
    );
  }

  /**
   * TOR exit nodeかチェック（簡易版）
   */
  private isTorExitNode(_ip: string): boolean {
    // 実際の実装では、TOR exit nodeリストを使用
    // この例では常にfalse
    return false;
  }

  /**
   * 過度なリクエストの履歴チェック
   */
  private hasExcessiveRequests(_ip: string): boolean {
    // 実際の実装では、レート制限の履歴をチェック
    // この例では常にfalse
    return false;
  }
}

export const ipValidator = new IpValidator();