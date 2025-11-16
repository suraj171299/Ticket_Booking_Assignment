import ApiError from '../errors/api-error.js'
import InternalServerError from '../errors/internal-server-error.js'
import logger from '../utils/logger.js'
import errorResponse from '../utils/error-response.js'

const errorHandler = (err, req, res, next) => {
    const status = err.statusCode || 500
    let error = err instanceof ApiError ? err : new InternalServerError(err.message || 'Unknown error', err.suggestion);
    const logMessage = `${status} - ${error.message} - ${req.method} - ${req.originalUrl}`

    if (status >= 500) {
        logger.error(logMessage, { stack: err.stack || error.stack })
    } else if (status >= 400) {
        logger.warn(logMessage, { stack: err.stack || error.stack })
    } else {
        logger.info(logMessage)
    }
    errorResponse(res, error, `${req.method}`, `${req.originalUrl}`)
}

export default errorHandler
