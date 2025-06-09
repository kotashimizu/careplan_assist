import { PresetTemplate } from '../types/tenant';

export const presets: PresetTemplate[] = [
  {
    id: 'healthcare',
    name: '医療機関向け',
    description: 'HIPAA準拠、患者データの最高レベル保護',
    industry: 'healthcare',
    recommended: true,
    features: {
      auth: true,
      encryption: true,
      audit: true,
      mfa: true,
      audioProcessing: true,
      videoCall: true,
      appointments: true,
      billing: true,
      notifications: true,
      fileUpload: true
    },
    security: {
      level: 'maximum',
      encryption: {
        algorithm: 'AES-256',
        autoEncryptPII: true,
        encryptAtRest: true,
        encryptInTransit: true
      },
      authentication: {
        requireMFA: true,
        sessionTimeout: 900, // 15分
        passwordPolicy: {
          minLength: 12,
          complexity: 'high'
        }
      },
      rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000
      }
    },
    compliance: {
      standards: ['HIPAA', 'GDPR'],
      dataRetention: {
        enabled: true,
        days: 2555 // 7年
      },
      dataLocation: {
        restricted: true,
        allowedRegions: ['us', 'ca']
      }
    }
  },
  {
    id: 'finance',
    name: '金融機関向け',
    description: 'PCI-DSS準拠、金融取引の高度なセキュリティ',
    industry: 'finance',
    recommended: true,
    features: {
      auth: true,
      encryption: true,
      audit: true,
      mfa: true,
      billing: true,
      notifications: true,
      analytics: true
    },
    security: {
      level: 'maximum',
      encryption: {
        algorithm: 'AES-256',
        autoEncryptPII: true,
        encryptAtRest: true,
        encryptInTransit: true
      },
      authentication: {
        requireMFA: true,
        sessionTimeout: 600, // 10分
        passwordPolicy: {
          minLength: 14,
          complexity: 'high'
        }
      },
      rateLimit: {
        enabled: true,
        maxRequests: 50,
        windowMs: 60000
      }
    },
    compliance: {
      standards: ['PCI-DSS', 'SOC2', 'GDPR'],
      dataRetention: {
        enabled: true,
        days: 2920 // 8年
      },
      dataLocation: {
        restricted: true,
        allowedRegions: ['us', 'eu', 'jp']
      }
    }
  },
  {
    id: 'education',
    name: '教育機関向け',
    description: 'FERPA準拠、学生データの適切な管理',
    industry: 'education',
    features: {
      auth: true,
      encryption: true,
      audit: true,
      mfa: false,
      videoCall: true,
      chat: true,
      fileUpload: true,
      notifications: true
    },
    security: {
      level: 'high',
      encryption: {
        algorithm: 'AES-256',
        autoEncryptPII: true,
        encryptAtRest: true,
        encryptInTransit: true
      },
      authentication: {
        requireMFA: false,
        sessionTimeout: 3600, // 1時間
        passwordPolicy: {
          minLength: 10,
          complexity: 'medium'
        }
      }
    },
    compliance: {
      standards: ['FERPA', 'COPPA'],
      dataRetention: {
        enabled: true,
        days: 1095 // 3年
      },
      dataLocation: {
        restricted: false,
        allowedRegions: []
      }
    }
  },
  {
    id: 'ecommerce',
    name: 'ECサイト向け',
    description: 'PCI-DSS対応、顧客データと決済情報の保護',
    industry: 'ecommerce',
    features: {
      auth: true,
      encryption: true,
      audit: true,
      mfa: false,
      billing: true,
      inventory: true,
      analytics: true,
      notifications: true,
      chat: true
    },
    security: {
      level: 'high',
      encryption: {
        algorithm: 'AES-256',
        autoEncryptPII: true,
        encryptAtRest: true,
        encryptInTransit: true
      },
      authentication: {
        requireMFA: false,
        sessionTimeout: 1800, // 30分
        passwordPolicy: {
          minLength: 8,
          complexity: 'medium'
        }
      },
      rateLimit: {
        enabled: true,
        maxRequests: 200,
        windowMs: 60000
      }
    },
    compliance: {
      standards: ['PCI-DSS', 'GDPR', 'CCPA'],
      dataRetention: {
        enabled: true,
        days: 1095 // 3年
      },
      dataLocation: {
        restricted: false,
        allowedRegions: []
      }
    }
  },
  {
    id: 'government',
    name: '政府機関向け',
    description: '最高レベルのセキュリティとコンプライアンス',
    industry: 'government',
    features: {
      auth: true,
      encryption: true,
      audit: true,
      mfa: true,
      videoCall: true,
      fileUpload: true,
      notifications: true
    },
    security: {
      level: 'maximum',
      encryption: {
        algorithm: 'AES-256',
        autoEncryptPII: true,
        encryptAtRest: true,
        encryptInTransit: true
      },
      authentication: {
        requireMFA: true,
        sessionTimeout: 600, // 10分
        passwordPolicy: {
          minLength: 16,
          complexity: 'high'
        }
      },
      rateLimit: {
        enabled: true,
        maxRequests: 50,
        windowMs: 60000
      }
    },
    compliance: {
      standards: ['ISO27001', 'SOC2'],
      dataRetention: {
        enabled: true,
        days: 3650 // 10年
      },
      dataLocation: {
        restricted: true,
        allowedRegions: ['us']
      }
    }
  },
  {
    id: 'gaming',
    name: 'ゲーム向け',
    description: 'チート対策とプレイヤーデータ保護',
    industry: 'gaming',
    features: {
      auth: true,
      encryption: true,
      audit: true,
      mfa: false,
      chat: true,
      notifications: true,
      analytics: true,
      fileUpload: false
    },
    security: {
      level: 'high',
      encryption: {
        algorithm: 'AES-256',
        autoEncryptPII: true,
        encryptAtRest: true,
        encryptInTransit: true
      },
      authentication: {
        requireMFA: false,
        sessionTimeout: 7200, // 2時間
        passwordPolicy: {
          minLength: 8,
          complexity: 'low'
        }
      },
      rateLimit: {
        enabled: true,
        maxRequests: 300,
        windowMs: 60000
      }
    }
  },
  {
    id: 'blog',
    name: 'ブログ・メディア向け',
    description: 'コンテンツ管理と基本的なセキュリティ',
    industry: 'blog',
    features: {
      auth: true,
      encryption: false,
      audit: true,
      mfa: false,
      chat: false,
      notifications: true,
      analytics: true,
      fileUpload: true
    },
    security: {
      level: 'standard',
      encryption: {
        algorithm: 'AES-256',
        autoEncryptPII: false,
        encryptAtRest: false,
        encryptInTransit: true
      },
      authentication: {
        requireMFA: false,
        sessionTimeout: 3600, // 1時間
        passwordPolicy: {
          minLength: 8,
          complexity: 'low'
        }
      }
    }
  },
  {
    id: 'general',
    name: '一般向け',
    description: 'バランスの取れた汎用設定',
    industry: 'general',
    features: {
      auth: true,
      encryption: true,
      audit: true,
      mfa: false,
      notifications: true,
      fileUpload: true
    },
    security: {
      level: 'standard',
      encryption: {
        algorithm: 'AES-256',
        autoEncryptPII: true,
        encryptAtRest: false,
        encryptInTransit: true
      },
      authentication: {
        requireMFA: false,
        sessionTimeout: 3600, // 1時間
        passwordPolicy: {
          minLength: 8,
          complexity: 'medium'
        }
      }
    }
  }
];

// プリセットIDで取得
export function getPresetById(id: string): PresetTemplate | undefined {
  return presets.find(preset => preset.id === id);
}

// 業界別でプリセットを取得
export function getPresetsByIndustry(industry: string): PresetTemplate[] {
  return presets.filter(preset => preset.industry === industry);
}

// 推奨プリセットを取得
export function getRecommendedPresets(): PresetTemplate[] {
  return presets.filter(preset => preset.recommended);
}