export class RUT {
  private constructor(private readonly value: string) {}

  /**
   * Creates a validated RUT from any format
   * Accepts: "12.345.678-9", "123456789", "12345678-9"
   */
  static create(rut: string): RUT | null {
    const cleaned = RUT.clean(rut)

    if (!/^\d{7,8}[\dkK]$/.test(cleaned)) {
      return null
    }

    if (!RUT.validateDV(cleaned)) {
      return null
    }

    return new RUT(cleaned)
  }

  /**
   * Cleans RUT removing dots and dashes
   */
  static clean(rut: string): string {
    return rut.replace(/[.\-\s]/g, "").toLowerCase()
  }

  /**
   * Normalizes to format "12345678-9" (no dots, with dash)
   */
  static normalize(rut: string): string {
    const cleaned = RUT.clean(rut)
    if (cleaned.length < 2) return cleaned
    const body = cleaned.slice(0, -1)
    const dv = cleaned.slice(-1).toUpperCase()
    return `${body}-${dv}`
  }

  /**
   * Validates the check digit (dígito verificador)
   */
  static validateDV(rut: string): boolean {
    const cleaned = RUT.clean(rut)
    if (cleaned.length < 2) return false

    const body = cleaned.slice(0, -1)
    const dv = cleaned.slice(-1)

    let sum = 0
    let multiplier = 2

    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number.parseInt(body[i]) * multiplier
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }

    const expectedDv = 11 - (sum % 11)
    const dvChar = expectedDv === 11 ? "0" : expectedDv === 10 ? "k" : String(expectedDv)

    return dv === dvChar
  }

  /**
   * Checks if format is valid (without validating check digit)
   */
  static isValidFormat(rut: string): boolean {
    const cleaned = RUT.clean(rut)
    return /^\d{7,8}[\dkK]$/.test(cleaned)
  }

  /**
   * Formats with dots: "12.345.678-9"
   */
  format(): string {
    const body = this.value.slice(0, -1)
    const dv = this.value.slice(-1)
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv.toUpperCase()}`
  }

  /**
   * Returns normalized format: "12345678-9"
   */
  toString(): string {
    const body = this.value.slice(0, -1)
    const dv = this.value.slice(-1).toUpperCase()
    return `${body}-${dv}`
  }
}
