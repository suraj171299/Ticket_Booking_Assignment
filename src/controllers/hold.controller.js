import { createHold } from "../services/hold.sevice.js"
import ApiResponse from "../utils/api-response.js"

export const createHoldHandler = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { eventId } = req.params
    const { seats } = req.body

    const hold = await createHold(userId, eventId, seats)

    return res.status(201).json(new ApiResponse(201, hold, 'Seats held successfully'));
  } catch (error) {
    next(error)
  }
}