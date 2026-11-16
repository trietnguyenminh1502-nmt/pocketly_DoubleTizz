/**
 * Standardized API Response Helper
 * Format: { success, data, message, errors }
 */
export const successResponse = (res, { status = 200, message = 'Success', data = null } = {}) => {
  return res.status(status).json({
    success: true,
    data,
    message,
    errors: null
  });
};

export const errorResponse = (res, { status = 500, message = 'Internal Server Error', errors = null } = {}) => {
  return res.status(status).json({
    success: false,
    data: null,
    message,
    errors
  });
};
