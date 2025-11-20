import { format, isValid, parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import BadRequestError from "../errors/bad-request-error.js";
import { Booking, Event, Hold } from "../models/index.js";
import NotFoundError from "../errors/not-found-error.js";
import { sequelize } from "../utils/database.js";
import { Op } from "sequelize";


const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export async function createEvent({ name, date, location, totalSeats, timeZone }) {
  if (!name) throw new BadRequestError('Event name is required');
  if (!date) throw new BadRequestError('Event date is required');
  if (!location) throw new BadRequestError('Event location is required');
  if (totalSeats == null || totalSeats < 0) throw new BadRequestError('Total seats must be a non-negative number');

  const parsedDate = parse(date, "yyyy-MM-dd HH:mm", new Date());
  if (!isValid(parsedDate)) {
    throw new BadRequestError('Invalid date format', "Date must be 'YYYY-MM-DD HH:mm' (24-hour format)");
  }

  const utcDate = fromZonedTime(parsedDate, DEFAULT_TIMEZONE);

  if (utcDate.getTime() <= new Date()) {
    throw new BadRequestError('Event date must be in the future');
  }

  const event = await Event.create({
    name,
    date: utcDate,
    location,
    total_seats: totalSeats
  })

  return event
}

export async function getAllEvents() {
  return await Event.findAll({
    order: [['date', 'ASC']]
  })
}

export async function getEventById(eventId) {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new NotFoundError('Event not found');
  }
  return event
}

export async function updateEvent(eventId, updateData = {}) {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new NotFoundError('Event not found');
  }

  if (updateData.date) {
    const parsedDate = parse(updateData.date, "yyyy-MM-dd HH:mm", new Date());
    if (!isValid(parsedDate)) {
      throw new BadRequestError('Invalid date format', "Date must be 'YYYY-MM-DD HH:mm' (24-hour format)");
    }

    const utcDate = fromZonedTime(parsedDate, DEFAULT_TIMEZONE);

    if (utcDate.getTime() <= new Date()) {
      throw new BadRequestError('Event date must be in the future');
    }
    updateData.date = utcDate;

    if (updateData.totalSeats) {
      return await sequelize.transaction(async (t) => {
        const lockedRow = await Event.findByPk(eventId, { lock: t.LOCK.UPDATE, transaction: t });

        const booked = await Booking.sum('seats', {
          where: { event_id: eventId, status: 'CONFIRMED' },
          transaction: t
        })

        const held = await Hold.sum('seats', {
          where: { event_id: eventId, status: 'ACTIVE' || 'CONFIRMED' },
        })

        const reservedSeats = Number(booked || 0) + Number(held || 0);

        if (updateData.totalSeats < reservedSeats) {
          throw new BadRequestError(`Total seats cannot be less than already reserved seats: ${reservedSeats}`);
        }

        await lockedRow.update({ ...updateData, total_seats: updateData.totalSeats }, { transaction: t });
        return lockedRow;
      })
    }
    const updatedEvent = await sequelize.transaction(async (t) => {
      await event.update(updateData, { transaction: t });
      return event;
    })
    return updatedEvent;
  }
}

export async function deleteEvent(eventId) {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new NotFoundError('Event not found');
  }
  const result = await event.destroy();
  return result
}

export async function getEventAvailability(eventId) {
  const event = await Event.findByPk(eventId, {
    attributes: ['id', 'name', 'date', 'location', 'total_seats']
  });
  if (!event) {
    throw new NotFoundError('Event not found');
  }

  const now = new Date()

  const heldSeats = await Hold.sum('seats', {
    where: {
      event_id: eventId,
      status: 'ACTIVE',
      expires_at: { [Op.gt]: now }
    }
  })

  const bookedSeats = await Booking.sum('seats', {
    where: { event_id: eventId, status: 'CONFIRMED' }
  })

  const eventCapacity = {
    event_id: event.id,
    event_name: event.name,
    event_data: format(event.date, "yyyy-MM-dd HH:mm"),
    event_location: event.location,
    total_seats: event.total_seats,
    held_seats: heldSeats || 0,
    booked_seats: bookedSeats || 0,
    available_seats: event.total_seats - (Number(heldSeats || 0) + Number(bookedSeats || 0))
  }

  return eventCapacity
}