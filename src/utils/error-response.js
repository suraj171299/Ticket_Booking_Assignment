const errorResponse = (res, error, method, url) => {

  const statusCode = error.statusCode || 500
  const message = error.message || "Internal Server Error"
  const description = error.description || "An unexpected error occured"
  const suggestion = error.suggestion || "Please try again later"

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      description,
      suggestion,
      errors: error.errors && error.errors.length > 0 ? error.errors : undefined
    }
  })
}

export default errorResponse