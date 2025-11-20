import { formatInTimeZone } from "date-fns-tz"
import { cancelBooking, confirmHold, getAllUserBookings, getBookingById } from "../services/booking.service.js"
import ApiResponse from "../utils/api-response.js"
import ForbiddenError from "../errors/forbidden-error.js"
import NotFoundError from "../errors/not-found-error.js"
import { formatBookingResponse } from "../utils/format-booking-response.js"


export const confirmHoldHandler = async (req, res, next) => {
  try {
    const { holdId } = req.params
    const userId = req.user.id

    const booking = await confirmHold(holdId, userId)

    return res.status(201).json(new ApiResponse(201, booking, 'Hold confirmed and booking created successfully'));
  } catch (error) {
    next(error)
  }
}

export const cancelBookingHandler = async (req, res, next) => {
  try {
    const bookingId = req.params.id
    const userId = req.user.id

    const cancelledBooking = await cancelBooking(bookingId, userId)

    return res.status(200).json(new ApiResponse(200, cancelledBooking, 'Booking cancelled successfully'));
  } catch (error) {
    next(error)
  }
}

export const getBookingByIdHandler = async (req, res, next) => {
  try {
    const bookingId = req.params.id
    const user = req.user

    const booking = await getBookingById(bookingId, user.id, { includeRelations: true })
    if (!booking) throw new NotFoundError('Booking not found')

    if (user.role !== 'ADMIN' && user.id !== booking.user_id) throw new ForbiddenError("Admin Privileges required", 'You are not allowed to see this booking')

    const formatBooking = booking.get({ plain: true });
    formatBooking.event.date = formatInTimeZone(formatBooking.event.date, "Asia/Kolkata", "yyyy-MM-dd HH:mm")

    return res.status(200).json(new ApiResponse(200, formatBooking, 'Booking fetched successfully'));
  } catch (error) {
    next(error)
  }
}

export const getAllUserBookingsHandler = async (req, res, next) => {
  try {
    const user = req.user
    let userId
    const { eventId, status, page = 0, limit = 10 } = req.query

    if (user.role !== 'ADMIN') {
      userId = user.id
    }

    const result = await getAllUserBookings({
      eventId: eventId ? eventId : null,
      userId: userId ? userId : null,
      status,
      page,
      limit
    })

    const message = result.total === 0 ? 'No bookings found' : 'Bookings list fetched successfully';

    const formatted = result.data.map(r => formatBookingResponse(r))
    return res.status(200).json(new ApiResponse(200, formatted, message))
  } catch (error) {
    next(error)
  }
}