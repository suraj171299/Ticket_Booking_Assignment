import { v4 as uuidv4 } from 'uuid';
import BadRequestError from "../errors/bad-request-error.js";
import { sequelize } from '../utils/database.js';
import { Booking, Event, Hold } from '../models/index.js'
import NotFoundError from '../errors/not-found-error.js';
import ConflictError from '../errors/conflict-error.js';

const HOLD_TTL_MINUTES = parseInt(process.env.HOLD_EXPIRES_IN_MINUTES)

export async function createHold(userId, eventId, seatNumbers) {
  if (!Number.isInteger(seatNumbers) || seatNumbers <= 0) {
    throw new BadRequestError('seatNumbers must be a positive integer');
  }
  return await sequelize.transaction(async (t) => {
    const event = await Event.findByPk(eventId, { transaction: t, lock: t.LOCK.UPDATE })
    if (!event) throw new NotFoundError('Event not found');

    if (userId) {
      const existingBooking = await Booking.findOne({
        where: { event_id: eventId, user_id: userId, status: 'CONFIRMED' },
        transaction: t,
      })

      if (existingBooking) throw new ConflictError('User already has a confirmed booking for this event', "Booking conflict")
    }

    const booked = await Booking.sum('seats', {
      where: { event_id: eventId, status: 'CONFIRMED' },
      transaction: t,
    })

    const held = await Hold.sum('seats', {
      where: { event_id: eventId, status: 'ACTIVE' },
      transaction: t,
    })

    const available = Number(event.total_seats) - Number(booked) - Number(held)

    let message = `Only ${available} seats are available for event ${event.name}`;
    if (seatNumbers > available) throw new BadRequestError(message, "Please select fewer seats")

    const expiresAt = new Date(Date.now() + HOLD_TTL_MINUTES * 60 * 1000)

    const hold = await Hold.create({
      hold_id: uuidv4(),
      event_id: eventId,
      user_id: userId,
      seats: seatNumbers,
      status: 'ACTIVE',
      expires_at: expiresAt
    }, { transaction: t })

    return hold;
  })
}