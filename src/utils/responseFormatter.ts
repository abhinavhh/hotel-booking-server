// utils/responseFormatter.ts
export class ResponseFormatter {
  static success(data: any, message?: string) {
    return {
      success: true,
      message: message || 'Success',
      data
    };
  }

  static error(message: string, statusCode: number = 500, errors?: any) {
    return {
      success: false,
      message,
      statusCode,
      errors
    };
  }

  static paginated(data: any[], page: number, limit: number, total: number) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  }
}