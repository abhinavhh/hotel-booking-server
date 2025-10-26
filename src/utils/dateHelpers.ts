export class DateHelpers {
  static calculateNights(checkIn: Date, checkOut: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((checkOut.getTime() - checkIn.getTime()) / oneDay));
  }

  static isValidDateRange(checkIn: Date, checkOut: Date): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return checkIn >= now && checkOut > checkIn;
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}