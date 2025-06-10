import { 
  Patient, 
  Practitioner, 
  Observation, 
  DiagnosticReport,
  Bundle,
  Resource,
  Identifier,
  HumanName,
  ContactPoint,
  Address,
  CodeableConcept,
  Reference,
  OperationOutcome
} from '../types/fhir';
import { dataMaskingService } from './dataMaskingService';
import { kmsService } from './kmsService';
import { auditLogService } from './auditLogService';

// FHIR変換オプション
export interface FHIRConversionOptions {
  includeMetadata?: boolean;
  maskSensitiveData?: boolean;
  encryptData?: boolean;
  validateOutput?: boolean;
  profile?: string;
}

// カスタムデータ形式（例）
export interface CustomPatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  ssn?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  mrn?: string; // Medical Record Number
}

// カスタム観察データ
export interface CustomObservationData {
  id: string;
  patientId: string;
  type: string;
  value: any;
  unit?: string;
  date: string;
  performedBy?: string;
  notes?: string;
}

class FHIRService {
  /**
   * カスタムデータをFHIR Patient リソースに変換
   */
  async convertToFHIRPatient(
    data: CustomPatientData,
    options: FHIRConversionOptions = {}
  ): Promise<Patient> {
    const patient: Patient = {
      resourceType: 'Patient',
      id: data.id,
      meta: options.includeMetadata ? {
        lastUpdated: new Date().toISOString(),
        profile: [options.profile || 'http://hl7.org/fhir/StructureDefinition/Patient']
      } : undefined,
      identifier: [
        {
          use: 'official',
          type: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MR',
              display: 'Medical record number'
            }]
          },
          system: 'urn:oid:1.2.36.146.595.217.0.1',
          value: data.mrn || data.id
        }
      ],
      active: true,
      name: [{
        use: 'official',
        family: data.lastName,
        given: [data.firstName]
      }],
      gender: this.mapGender(data.gender),
      birthDate: data.dateOfBirth
    };

    // 連絡先情報
    if (data.email || data.phone) {
      patient.telecom = [];
      
      if (data.email) {
        patient.telecom.push({
          system: 'email',
          value: data.email,
          use: 'home'
        });
      }
      
      if (data.phone) {
        patient.telecom.push({
          system: 'phone',
          value: data.phone,
          use: 'mobile'
        });
      }
    }

    // 住所
    if (data.address) {
      patient.address = [{
        use: 'home',
        type: 'physical',
        line: [data.address.street],
        city: data.address.city,
        state: data.address.state,
        postalCode: data.address.zip
      }];
    }

    // SSNを拡張として追加（センシティブデータ）
    if (data.ssn && !options.maskSensitiveData) {
      patient.identifier?.push({
        use: 'official',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'SS',
            display: 'Social Security number'
          }]
        },
        system: 'http://hl7.org/fhir/sid/us-ssn',
        value: data.ssn
      });
    }

    // センシティブデータのマスキング
    if (options.maskSensitiveData) {
      return dataMaskingService.maskData(patient) as Patient;
    }

    // データの暗号化
    if (options.encryptData) {
      const encrypted = await kmsService.encrypt(JSON.stringify(patient));
      // 暗号化されたデータを含む特別なPatientリソースを返す
      return {
        ...patient,
        extension: [{
          url: 'http://example.org/fhir/StructureDefinition/encrypted-content',
          valueString: encrypted.ciphertext
        }]
      };
    }

    return patient;
  }

  /**
   * カスタムデータをFHIR Observation リソースに変換
   */
  async convertToFHIRObservation(
    data: CustomObservationData,
    options: FHIRConversionOptions = {}
  ): Promise<Observation> {
    const observation: Observation = {
      resourceType: 'Observation',
      id: data.id,
      meta: options.includeMetadata ? {
        lastUpdated: new Date().toISOString(),
        profile: [options.profile || 'http://hl7.org/fhir/StructureDefinition/Observation']
      } : undefined,
      status: 'final',
      code: this.mapObservationType(data.type),
      subject: {
        reference: `Patient/${data.patientId}`
      },
      effectiveDateTime: data.date
    };

    // 値の設定
    if (typeof data.value === 'number' && data.unit) {
      observation.valueQuantity = {
        value: data.value,
        unit: data.unit,
        system: 'http://unitsofmeasure.org',
        code: this.mapUnitCode(data.unit)
      };
    } else if (typeof data.value === 'string') {
      observation.valueString = data.value;
    } else if (typeof data.value === 'boolean') {
      observation.valueBoolean = data.value;
    }

    // 実施者
    if (data.performedBy) {
      observation.performer = [{
        reference: `Practitioner/${data.performedBy}`
      }];
    }

    // 備考
    if (data.notes) {
      observation.note = [{
        text: data.notes,
        time: new Date().toISOString()
      }];
    }

    return observation;
  }

  /**
   * 複数のリソースをFHIR Bundleに変換
   */
  createBundle(
    resources: Resource[],
    type: Bundle['type'] = 'collection'
  ): Bundle {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      id: this.generateId(),
      meta: {
        lastUpdated: new Date().toISOString()
      },
      type,
      timestamp: new Date().toISOString(),
      total: resources.length,
      entry: resources.map(resource => ({
        fullUrl: `urn:uuid:${resource.id}`,
        resource
      }))
    };

    return bundle;
  }

  /**
   * FHIRデータの検証
   */
  async validateFHIRResource(resource: Resource): Promise<OperationOutcome> {
    const issues: OperationOutcome['issue'] = [];

    // 基本的な検証
    if (!resource.resourceType) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'resourceType is required',
        location: ['resourceType']
      });
    }

    // リソースタイプ別の検証
    switch (resource.resourceType) {
      case 'Patient':
        this.validatePatient(resource as Patient, issues);
        break;
      case 'Observation':
        this.validateObservation(resource as Observation, issues);
        break;
      // 他のリソースタイプの検証...
    }

    return {
      resourceType: 'OperationOutcome',
      issue: issues
    };
  }

  /**
   * Patient リソースの検証
   */
  private validatePatient(patient: Patient, issues: OperationOutcome['issue']): void {
    // 名前の検証
    if (!patient.name || patient.name.length === 0) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'Patient must have at least one name',
        location: ['Patient.name']
      });
    }

    // 性別の検証
    const validGenders = ['male', 'female', 'other', 'unknown'];
    if (patient.gender && !validGenders.includes(patient.gender)) {
      issues.push({
        severity: 'error',
        code: 'invalid',
        diagnostics: `Invalid gender value: ${patient.gender}`,
        location: ['Patient.gender']
      });
    }

    // 生年月日の形式検証
    if (patient.birthDate && !this.isValidDate(patient.birthDate)) {
      issues.push({
        severity: 'error',
        code: 'invalid',
        diagnostics: 'Invalid date format for birthDate',
        location: ['Patient.birthDate']
      });
    }
  }

  /**
   * Observation リソースの検証
   */
  private validateObservation(observation: Observation, issues: OperationOutcome['issue']): void {
    // ステータスの検証
    const validStatuses = ['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown'];
    if (!validStatuses.includes(observation.status)) {
      issues.push({
        severity: 'error',
        code: 'invalid',
        diagnostics: `Invalid status value: ${observation.status}`,
        location: ['Observation.status']
      });
    }

    // コードの検証
    if (!observation.code) {
      issues.push({
        severity: 'error',
        code: 'required',
        diagnostics: 'Observation must have a code',
        location: ['Observation.code']
      });
    }
  }

  /**
   * FHIR形式から内部形式への変換
   */
  async convertFromFHIRPatient(patient: Patient): Promise<CustomPatientData> {
    const customData: CustomPatientData = {
      id: patient.id || this.generateId(),
      firstName: patient.name?.[0]?.given?.[0] || '',
      lastName: patient.name?.[0]?.family || '',
      dateOfBirth: patient.birthDate || '',
      gender: patient.gender || 'unknown'
    };

    // 識別子から情報を抽出
    patient.identifier?.forEach(identifier => {
      if (identifier.type?.coding?.[0]?.code === 'MR') {
        customData.mrn = identifier.value;
      } else if (identifier.type?.coding?.[0]?.code === 'SS') {
        customData.ssn = identifier.value;
      }
    });

    // 連絡先情報
    patient.telecom?.forEach(telecom => {
      if (telecom.system === 'email') {
        customData.email = telecom.value;
      } else if (telecom.system === 'phone') {
        customData.phone = telecom.value;
      }
    });

    // 住所
    if (patient.address?.[0]) {
      const addr = patient.address[0];
      customData.address = {
        street: addr.line?.[0] || '',
        city: addr.city || '',
        state: addr.state || '',
        zip: addr.postalCode || ''
      };
    }

    return customData;
  }

  /**
   * セキュアなFHIRデータ交換
   */
  async secureFHIRExchange(
    resource: Resource,
    recipientId: string,
    userId: string
  ): Promise<{ encryptedData: string; keyId: string }> {
    // データをJSON文字列化
    const jsonData = JSON.stringify(resource);

    // KMSで暗号化
    const encrypted = await kmsService.encrypt(jsonData, undefined, userId);

    // 監査ログ
    await auditLogService.log({
      action: 'FHIR_DATA_EXCHANGE',
      userId,
      resourceType: 'fhir',
      resourceId: resource.id || 'unknown',
      details: {
        resourceType: resource.resourceType,
        recipient: recipientId,
        encrypted: true
      },
      severity: 'info'
    });

    return {
      encryptedData: encrypted.ciphertext,
      keyId: encrypted.keyId
    };
  }

  /**
   * 性別のマッピング
   */
  private mapGender(gender: string): Patient['gender'] {
    const genderMap: Record<string, Patient['gender']> = {
      'M': 'male',
      'F': 'female',
      'O': 'other',
      'U': 'unknown',
      'male': 'male',
      'female': 'female',
      'other': 'other',
      'unknown': 'unknown'
    };

    return genderMap[gender] || 'unknown';
  }

  /**
   * 観察タイプのマッピング
   */
  private mapObservationType(type: string): CodeableConcept {
    const typeMap: Record<string, CodeableConcept> = {
      'blood_pressure': {
        coding: [{
          system: 'http://loinc.org',
          code: '85354-9',
          display: 'Blood pressure panel'
        }]
      },
      'heart_rate': {
        coding: [{
          system: 'http://loinc.org',
          code: '8867-4',
          display: 'Heart rate'
        }]
      },
      'temperature': {
        coding: [{
          system: 'http://loinc.org',
          code: '8310-5',
          display: 'Body temperature'
        }]
      },
      'weight': {
        coding: [{
          system: 'http://loinc.org',
          code: '29463-7',
          display: 'Body weight'
        }]
      }
    };

    return typeMap[type] || {
      coding: [{
        system: 'http://example.org/custom-observations',
        code: type,
        display: type
      }]
    };
  }

  /**
   * 単位コードのマッピング
   */
  private mapUnitCode(unit: string): string {
    const unitMap: Record<string, string> = {
      'kg': 'kg',
      'lb': '[lb_av]',
      '°C': 'Cel',
      '°F': '[degF]',
      'bpm': '/min',
      'mmHg': 'mm[Hg]'
    };

    return unitMap[unit] || unit;
  }

  /**
   * 日付の検証
   */
  private isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}(-\d{2}(-\d{2})?)?$/;
    return dateRegex.test(dateString);
  }

  /**
   * ID生成
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const fhirService = new FHIRService();