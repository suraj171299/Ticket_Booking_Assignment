import ApiError from "./api-error.js"

class BadRequestError extends ApiError {
  constructor(message = "Bad Request", description, errors = [], suggestion) {
    super(message, 400, description, suggestion)
    this.errors = errors
  }
}

export default BadRequestError