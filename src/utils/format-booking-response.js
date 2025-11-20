import { formatInTimeZone } from "date-fns-tz"

export function formatBookingResponse(booking) {
  const b = booking.get({ plain: true })

  return {
    id: b.id,
    seats: b.seats,
    status: b.status,
    cancelled_at: b.cancelled_at,
    event: {
      id: b.event.id,
      name: b.event.name,
      date: formatInTimeZone(b.event.date, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm'),
      location: b.event.location,
      total_seats: b.event.total_seats
    },
    user: b.user ? {
      id: b.user.id,
      name: b.user.name,
      email: b.user.email
    } : null
  }
}