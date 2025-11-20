import ApiError from './api-error.js'

class ConflictError extends ApiError {
  constructor(message = "Resource Conflict", description, suggestion) {
    super(message, 409, description, suggestion)
  }
}

export default ConflictError
