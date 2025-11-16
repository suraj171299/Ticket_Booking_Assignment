import ApiError from './api-error.js'

class InternalServerError extends ApiError {
  constructor(message = "Internal server error", description, suggestion) {
    super(message, 500, description, suggestion)
  }
}

export default InternalServerError