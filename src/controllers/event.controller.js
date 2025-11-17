import { format } from "date-fns";
import { createEvent, deleteEvent, getAllEvents, getEventAvailability, getEventById, updateEvent } from "../services/event.service.js";
import ApiResponse from "../utils/api-response.js";
import { formatInTimeZone } from "date-fns-tz";

function formatEvent(event) {
  return {
    id: event.id,
    name: event.name,
    date: formatInTimeZone(event.date, "Asia/KOlkata", "yyyy-MM-dd HH:mm"),
    location: event.location,
    total_seats: event.total_seats
  }
}


export const createEventHandler = async (req, res, next) => {
  try {
    const { name, date, location, totalSeats } = req.body;
    const event = await createEvent({ name, date, location, totalSeats });
    const eventData = {
      id: event.id,
      name: event.name,
      date: format(event.date, "yyyy-MM-dd HH:mm"),
      location: event.location,
      total_seats: event.total_seats
    }

    return res.status(201).json(new ApiResponse(201, eventData, 'Event created successfully'));
  } catch (error) {
    next(error)
  }
}

export const getAllEventsHandler = async (req, res, next) => {
  try {
    const events = await getAllEvents()
    return res.status(200).json(new ApiResponse(200, events.map(formatEvent), 'Events fetched successfully'));
  } catch (error) {
    next(error)
  }
}

export const getEventByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const event = await getEventById(id)
    return res.status(200).json(new ApiResponse(200, formatEvent(event), 'Event fetched successfully'));
  } catch (error) {
    next(error)
  }
}

export const updateEventHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const event = await updateEvent(id, updateData)
    return res.status(200).json(new ApiResponse(200, formatEvent(event), 'Event updated successfully'));
  } catch (error) {
    next(error)
  }
}

export const deleteEventHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await deleteEvent(id)

    return res.status(200).json(new ApiResponse(200, result, 'Event deleted successfully'));
  } catch (error) {
    next(error)
  }
}

export const getEventAvailabilityHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const data = await getEventAvailability(id)
    return res.status(200).json(new ApiResponse(200, data, 'Event availability fetched successfully'));
  } catch (error) {
    next(error)
  }
}