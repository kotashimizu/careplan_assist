export const COMPLIANCE_STANDARDS = {
  HIPAA: {
    name: 'HIPAA',
    fullName: 'Health Insurance Portability and Accountability Act',
    region: 'US',
    description: '米国の医療情報プライバシー保護法',
    requirements: {
      encryption: 'AES-256',
      accessControl: 'mandatory',
      auditLogs: 'required',
      dataRetention: 2555, // 7年
      incidentResponse: 'required',
      businessAssociate: 'required',
      minimumNecessary: 'required'
    },
    dataTypes: [
      'medical_records',
      'patient_info',
      'health_plans',
      'billing_information',
      'healthcare_providers'
    ],
    penalties: {
      min: 100,
      max: 50000,
      criminal: 250000
    }
  },

  GDPR: {
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    region: 'EU',
    description: 'EUの一般データ保護規則',
    requirements: {
      encryption: 'state-of-the-art',
      consent: 'explicit',
      rightToErasure: 'required',
      dataPortability: 'required',
      privacyByDesign: 'required',
      dpoRequired: 'conditional',
      breachNotification: 72 // hours
    },
    dataTypes: [
      'personal_data',
      'sensitive_data',
      'biometric_data',
      'genetic_data',
      'location_data'
    ],
    penalties: {
      percentage: 4, // % of annual revenue
      maxAmount: 20000000 // €20M
    }
  },

  PCI_DSS: {
    name: 'PCI-DSS',
    fullName: 'Payment Card Industry Data Security Standard',
    region: 'Global',
    description: 'クレジットカード業界のデータセキュリティ基準',
    requirements: {
      firewall: 'required',
      encryption: 'strong',
      accessControl: 'strict',
      monitoring: 'continuous',
      testing: 'regular',
      securityPolicy: 'maintained',
      vulnerabilityManagement: 'required'
    },
    dataTypes: [
      'cardholder_data',
      'payment_information',
      'authentication_data',
      'track_data'
    ],
    levels: {
      1: 'Over 6 million transactions annually',
      2: '1-6 million transactions annually',
      3: '20,000-1 million e-commerce transactions annually',
      4: 'Under 20,000 e-commerce transactions annually'
    }
  },

  SOC2: {
    name: 'SOC 2',
    fullName: 'Service Organization Control 2',
    region: 'US',
    description: 'サービス組織統制基準',
    requirements: {
      security: 'required',
      availability: 'optional',
      processing: 'optional',
      confidentiality: 'optional',
      privacy: 'optional'
    },
    trustPrinciples: [
      'security',
      'availability',
      'processing_integrity',
      'confidentiality',
      'privacy'
    ],
    auditFrequency: 'annual'
  },

  ISO27001: {
    name: 'ISO 27001',
    fullName: 'ISO/IEC 27001',
    region: 'Global',
    description: '情報セキュリティマネジメントシステム国際規格',
    requirements: {
      riskAssessment: 'required',
      securityPolicy: 'required',
      organizationalSecurity: 'required',
      assetManagement: 'required',
      accessControl: 'required',
      cryptography: 'required',
      physicalSecurity: 'required',
      operationalSecurity: 'required',
      communicationSecurity: 'required',
      acquisitionDevelopment: 'required',
      supplierRelationships: 'required',
      incidentManagement: 'required',
      businessContinuity: 'required',
      compliance: 'required'
    },
    controls: 114,
    certificationPeriod: 3 // years
  },

  FERPA: {
    name: 'FERPA',
    fullName: 'Family Educational Rights and Privacy Act',
    region: 'US',
    description: '米国の教育記録プライバシー法',
    requirements: {
      consentRequired: 'written',
      accessRights: 'parents_students',
      recordCorrection: 'allowed',
      disclosure: 'limited',
      directoryInfo: 'opt_out'
    },
    dataTypes: [
      'education_records',
      'student_information',
      'grades',
      'disciplinary_records'
    ],
    penalties: {
      fundingLoss: 'possible'
    }
  },

  CCPA: {
    name: 'CCPA',
    fullName: 'California Consumer Privacy Act',
    region: 'California, US',
    description: 'カリフォルニア州消費者プライバシー法',
    requirements: {
      rightToKnow: 'required',
      rightToDelete: 'required',
      rightToOptOut: 'required',
      nonDiscrimination: 'required',
      privacyPolicy: 'detailed'
    },
    thresholds: {
      revenue: 25000000, // $25M
      consumers: 50000,
      dataRevenue: 0.5 // 50% of revenue from selling data
    },
    penalties: {
      intentional: 7500,
      unintentional: 2500
    }
  }
} as const;

export const COMPLIANCE_MAPPINGS = {
  healthcare: ['HIPAA', 'GDPR'],
  finance: ['PCI_DSS', 'SOC2', 'GDPR'],
  education: ['FERPA', 'GDPR'],
  ecommerce: ['PCI_DSS', 'GDPR', 'CCPA'],
  government: ['ISO27001', 'SOC2'],
  gaming: ['GDPR', 'CCPA'],
  general: ['GDPR']
} as const;

export const DATA_CLASSIFICATION = {
  PUBLIC: {
    level: 0,
    description: '公開情報',
    examples: ['マーケティング資料', '公開されたブログ記事'],
    requirements: {
      encryption: false,
      accessControl: false,
      auditLog: false
    }
  },
  INTERNAL: {
    level: 1,
    description: '内部情報',
    examples: ['社内文書', '方針書'],
    requirements: {
      encryption: false,
      accessControl: true,
      auditLog: true
    }
  },
  CONFIDENTIAL: {
    level: 2,
    description: '機密情報',
    examples: ['顧客リスト', '財務情報'],
    requirements: {
      encryption: true,
      accessControl: true,
      auditLog: true,
      dataLossPrevention: true
    }
  },
  RESTRICTED: {
    level: 3,
    description: '極秘情報',
    examples: ['個人情報', '医療記録', '決済情報'],
    requirements: {
      encryption: true,
      accessControl: true,
      auditLog: true,
      dataLossPrevention: true,
      specialHandling: true
    }
  }
} as const;

export const BREACH_NOTIFICATION_REQUIREMENTS = {
  GDPR: {
    authority: 72, // hours
    dataSubject: 'without_undue_delay',
    threshold: 'likely_to_result_in_risk'
  },
  HIPAA: {
    authority: 1440, // 60 days in hours
    individual: 1440, // 60 days
    media: 1440, // 60 days (if >500 individuals)
  },
  CCPA: {
    authority: 'no_requirement',
    individual: 'no_requirement',
    threshold: 'no_specific_threshold'
  },
  PCI_DSS: {
    acquirer: 24, // hours
    cardBrands: 24, // hours
    lawEnforcement: 'immediately'
  }
} as const;

export const AUDIT_RETENTION_PERIODS = {
  HIPAA: 2555, // 7 years in days
  GDPR: 'as_long_as_necessary',
  PCI_DSS: 365, // 1 year minimum
  SOC2: 365, // 1 year minimum
  ISO27001: 'policy_defined',
  FERPA: 'varies_by_state',
  CCPA: 730 // 2 years
} as const;