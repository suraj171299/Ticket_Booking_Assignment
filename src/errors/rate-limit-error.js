import ApiError from "./api-error.js"

class RateLimitError extends ApiError {
  constructor(message = "Too many requests", description, suggestion) {
    super(message, 429, description, suggestion)
  }
}

export default RateLimitError