import ApiError from "./api-error.js"

class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", description, suggestion) {
    super(message, 403, description, suggestion)
  }
}

export default ForbiddenError