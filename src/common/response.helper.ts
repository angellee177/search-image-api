/**
 * Helper to generate a success response
 * 
 * @param message - Success message
 * @param data - Data to be returned
 * @returns A success response object
 */
export const successResponse = (message: string, data: any = null) => {
    return {
      success: true,
      message,
      result: data,
    };
};
  
/**
 * Helper to generate an error response
 * 
 * @param message - Error message
 * @param error - Optional error details (e.g., validation errors)
 * @returns An error response object
 */
export const errorResponse = (message: string, error: any = null) => {
    return {
        success: false,
        message,
        error,
    };
};
  