class ApiError extends Error {
  constructor(message, statusCode, description, suggestion) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    this.description = description || message;
    this.suggestion = suggestion || "Please try again later";
    Error.captureStackTrace(this, this.constructor);
  }
}
export default ApiError