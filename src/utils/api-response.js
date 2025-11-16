class ApiResponse {
  constructor(statusCode, data, message = "success", description, suggestion) {
    this.status = statusCode
    this.message = message
    this.data = data
    this.suggestion = suggestion
    this.description = description
    this.success = statusCode < 400
  }
}

export default ApiResponse