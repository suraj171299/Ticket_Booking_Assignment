import ApiError from './api-error.js'

class NotFoundError extends ApiError {
  constructor(message = "Resource not found", description, suggestion) {
    super(message, 404, description, suggestion)
  }
}

export default NotFoundError