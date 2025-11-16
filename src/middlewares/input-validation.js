import BadRequestError from '../errors/bad-request-error.js'
import { ZodError } from 'zod'

const validate = (input) => async (req, res, next) => {
  try {
    const parseBody = await input.parseAsync(req.body)
    req.body = parseBody
    next()
  } catch (error) {
    if (error instanceof ZodError && Array.isArray(error.issues)) {
      const details = error.issues.map(e => ({
        message: e.message,
      }))
      return next(new BadRequestError("Validation failed", "There are validation errors", details));
    }
    next(error);
  }
}


export default validate 