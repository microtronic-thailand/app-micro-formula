import { createHash } from 'crypto';

// Use a SALT from environment variable to prevent users with source code from generating keys
const SALT = process.env.LICENSE_SALT || "DEFAULT_MICRO_SALT_CHANGE_ME_IN_PRODUCTION";

export interface LicenseData {
    expiresAt: string;
    machineId?: string;
    type: 'monthly' | 'yearly' | 'lifetime';
}

/**
 * Validates a license key and returns the license data if valid.
 * Format: BASE64(JSON).SIGNATURE
 */
export function validateLicenseKey(key: string): { isValid: boolean; data?: LicenseData; error?: string } {
    if (!key || !key.includes('.')) {
        return { isValid: false, error: "รูปแบบคีย์ไม่ถูกต้อง" };
    }

    try {
        const [encodedData, signature] = key.split('.');

        // 1. Verify Signature
        const expectedSignature = createHash('md5').update(encodedData + SALT).digest('hex');
        if (signature !== expectedSignature) {
            return { isValid: false, error: "ลายเซ็นคีย์ไม่ถูกต้อง (Invalid Signature)" };
        }

        // 2. Decode Data
        const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
        const data: LicenseData = JSON.parse(decodedString);

        // 3. Check Expiration
        const expiryDate = new Date(data.expiresAt);
        const now = new Date();

        if (expiryDate < now) {
            return { isValid: false, data, error: `คีย์หมดอายุเมื่อวันที่ ${expiryDate.toLocaleDateString('th-TH')}` };
        }

        return { isValid: true, data };
    } catch (e) {
        return { isValid: false, error: "ไม่สามารถประมวลผลคีย์ได้" };
    }
}



/**
 * Checks if the system is locked based on the current stored license
 */
export async function getSystemLicenseStatus(getSettingFn: (key: string) => Promise<string | null>) {
    const key = await getSettingFn('license_key');
    if (!key) return { isValid: false, error: "กรุณาติดตั้ง Machine Key เพื่อเข้าใช้งานระบบ" };

    return validateLicenseKey(key);
}
