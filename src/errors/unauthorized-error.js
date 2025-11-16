import ApiError from './api-error.js'

class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", description, suggestion) {
    super(message, 401, description, suggestion)
  }
}

export default UnauthorizedError