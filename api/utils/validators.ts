export class Validators {
  /**
   * Validate if a value is a positive integer
   */
  static isPositiveInteger(value: any): boolean {
    const num = parseInt(value);
    return !isNaN(num) && num > 0;
  }

  /**
   * Validate if a string is not empty
   */
  static isNotEmpty(value: string | undefined | null): boolean {
    return Boolean(value && value.trim().length > 0);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize search query
   */
  static sanitizeSearchQuery(query: string): string {
    return query.trim().replace(/[<>]/g, '');
  }
}
