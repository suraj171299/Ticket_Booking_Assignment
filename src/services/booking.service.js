import { sequelize } from '../utils/database.js';
import { Booking, Event, Hold } from '../models/index.js'
import NotFoundError from '../errors/not-found-error.js';
import BadRequestError from '../errors/bad-request-error.js';
import ConflictError from '../errors/conflict-error.js';

export async function confirmHold(holdId, userId) {
  return await sequelize.transaction(async (t) => {
    const hold = await Hold.findOne({
      where: { hold_id: holdId, user_id: userId },
      transaction: t,
      lock: t.LOCK.UPDATE
    })

    if (!hold) throw new NotFoundError(`Hold for user with id: ${userId} not found`)
    if (hold.status !== 'ACTIVE') throw new BadRequestError('Only active holds can be confirmed')
    if (hold.expires_at < new Date()) throw new BadRequestError('Hold has expired')

    const event = await Event.findByPk(hold.event_id, {
      transaction: t,
      lock: t.LOCK.UPDATE
    })

    if (!event) throw new NotFoundError('Event associated with this hold does not exist', "Event associated with this hold does not exist")
    if (hold.user_id) {
      const existing = await Booking.findOne({
        where: {
          event_id: hold.event_id,
          user_id: hold.user_id,
          status: 'CONFIRMED'
        },
        transaction: t,
      })
      if (existing) throw new ConflictError('User already has a confirmed booking for this event', "Booking conflict")
    }

    const booking = await Booking.create({
      event_id: hold.event_id,
      user_id: hold.user_id,
      seats: hold.seats,
      status: 'CONFIRMED'
    }, { transaction: t })

    hold.status = "CONFIRMED"
    await hold.save({ transaction: t })

    return booking;
  })
}

export async function cancelBooking(bookingId, userId) {
  return await sequelize.transaction(async (t) => {
    const booking = await Booking.findOne({
      where: { id: bookingId, user_id: userId },
      transaction: t,
      lock: t.LOCK.UPDATE
    })

    if (!booking) throw new NotFoundError('Booking not found')

    booking.status = 'CANCELLED'
    booking.cancelled_at = new Date()

    await booking.save({ transaction: t })
    return booking;
  })
}

export async function getBookingById(bookingId, userId, options = { includeRelations: true }) {
  const include = []
  if (options.includeRelations) {
    include.push({ association: 'event', attributes: ['id', 'name', 'date', 'location', 'total_seats'] })
    include.push({ association: 'user', attributes: ['id', 'name', 'email'] })
  }

  const booking = await Booking.findOne({
    where: { id: bookingId, user_id: userId },
    attributes: ['id', 'event_id', 'user_id', 'seats', 'status', 'cancelled_at'],
    include,
  })

  return booking;
}

export async function getAllUserBookings({ eventId, userId, status, page = 0, limit = 10 }) {
  const where = {}
  if (eventId) where.event_id = eventId
  if (status) where.status = status
  if (userId) where.user_id = userId

  const offset = page * limit
  const { rows, count } = await Booking.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    include: [{ association: 'event', attributes: ['id', 'name', 'date', 'location', 'total_seats'] },
    { association: 'user', attributes: ['id', 'name', 'email'] }]
  })

  return { data: rows, total: count, page, limit }
}