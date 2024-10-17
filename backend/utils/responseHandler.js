// Helper function to send a success response
export const sendSuccessResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message: message
    };
    if (data) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
};

// Helper function to send an error response
export const sendErrorResponse = (res, statusCode, message, error = null) => {
    const response = {
        success: false,
        message: message
    };
    if (error && process.env.NODE_ENV === 'development') {
        response.error = error.toString();
    }
    return res.status(statusCode).json(response);
};