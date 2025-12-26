/**
 * Normalize phone number to standard format: 966XXXXXXXXX
 * Accepts: 05XXXXXXXX, 5XXXXXXXX, 9665XXXXXXXX, +9665XXXXXXXX, 00966XXXXXXXX
 * Returns: 966XXXXXXXXX or null if invalid
 */
export function normalizePhone(phone: string | null | undefined): string | null {
    if (!phone) return null

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')

    // Handle different formats
    if (cleaned.startsWith('00966')) {
        // 00966XXXXXXXXX -> 966XXXXXXXXX
        cleaned = cleaned.substring(2)
    } else if (cleaned.startsWith('966')) {
        // Already in correct format: 966XXXXXXXXX
        // Do nothing
    } else if (cleaned.startsWith('05')) {
        // 05XXXXXXXX -> 9665XXXXXXXX
        cleaned = '966' + cleaned.substring(1)
    } else if (cleaned.startsWith('5') && cleaned.length === 9) {
        // 5XXXXXXXX -> 9665XXXXXXXX
        cleaned = '966' + cleaned
    } else {
        // Invalid format
        return null
    }

    // Validate final format: must be 12 digits starting with 966
    if (cleaned.length === 12 && cleaned.startsWith('966')) {
        return cleaned
    }

    return null
}

/**
 * Format phone number for display
 * 966XXXXXXXXX -> +966 5X XXX XXXX
 */
export function formatPhoneDisplay(phone: string | null | undefined): string {
    if (!phone) return ''

    const normalized = normalizePhone(phone)
    if (!normalized) return phone

    // 966XXXXXXXXX -> +966 5X XXX XXXX
    return `+${normalized.substring(0, 3)} ${normalized.substring(3, 5)} ${normalized.substring(5, 8)} ${normalized.substring(8)}`
}

/**
 * Validate if phone number is valid Saudi number
 */
export function isValidSaudiPhone(phone: string | null | undefined): boolean {
    const normalized = normalizePhone(phone)
    if (!normalized) return false

    // Must start with 9665 (Saudi mobile numbers)
    return normalized.startsWith('9665')
}
