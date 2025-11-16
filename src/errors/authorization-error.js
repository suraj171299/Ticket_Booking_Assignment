import ApiError from './api-error.js'

class AuthorizationError extends ApiError {
  constructor(message = "Authorization error", description, suggestion) {
    super(message, 403, description, suggestion)
  }
}

export default AuthorizationError
