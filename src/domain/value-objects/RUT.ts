export class RUT {
  private constructor(private readonly value: string) {}

  static create(rut: string): RUT | null {
    const cleaned = rut.replace(/[.-]/g, "")

    if (!/^\d{7,8}[\dkK]$/.test(cleaned)) {
      return null
    }

    if (!RUT.validate(cleaned)) {
      return null
    }

    return new RUT(cleaned)
  }

  static validate(rut: string): boolean {
    const cleaned = rut.replace(/[.-]/g, "").toLowerCase()
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

  format(): string {
    const body = this.value.slice(0, -1)
    const dv = this.value.slice(-1)
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv.toUpperCase()}`
  }

  toString(): string {
    return this.value
  }
}
